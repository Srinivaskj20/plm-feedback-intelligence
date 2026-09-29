import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import {
  INITIAL_PRODUCTS,
  INITIAL_BOM,
  INITIAL_FEEDBACK,
  INITIAL_ECRS,
  INITIAL_WINDCHILL_CONFIG,
  INITIAL_AUDIT_LOGS,
} from './src/data/mockData';
import { FeedbackItem, EngineeringChangeRequest, WindchillConfig, AuditLog, Product, ComponentBOM } from './src/types';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Stateful in-memory stores for runtime lifecycle
let productsStore: Product[] = [...INITIAL_PRODUCTS];
let bomStore: ComponentBOM[] = [...INITIAL_BOM];
let feedbackStore: FeedbackItem[] = [...INITIAL_FEEDBACK];
let ecrStore: EngineeringChangeRequest[] = [...INITIAL_ECRS];
let windchillConfigStore: WindchillConfig = { ...INITIAL_WINDCHILL_CONFIG };
let auditLogsStore: AuditLog[] = [...INITIAL_AUDIT_LOGS];

// Lazy helper for Gemini Client
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is missing.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// ----------------------------------------------------
// COMPLETE REST API ROUTES
// ----------------------------------------------------

// Health Check Endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'Enterprise PLM Customer Feedback AI Service',
    version: '3.2.0',
    timestamp: new Date().toISOString(),
    windchillStatus: windchillConfigStore.status,
    totalProducts: productsStore.length,
    totalFeedback: feedbackStore.length,
    totalECRs: ecrStore.length,
    totalAuditLogs: auditLogsStore.length,
  });
});

// Summary Metrics API for Dashboards & Reporting
app.get('/api/reports/summary', (_req: Request, res: Response) => {
  const totalFeedback = feedbackStore.length;
  const criticalCount = feedbackStore.filter((f) => f.priority === 'Critical').length;
  const avgSentiment = totalFeedback
    ? Number((feedbackStore.reduce((acc, f) => acc + f.sentimentScore, 0) / totalFeedback).toFixed(2))
    : 0;

  const stageDistribution = feedbackStore.reduce((acc, f) => {
    acc[f.plmStage] = (acc[f.plmStage] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sentimentBreakdown = {
    Positive: feedbackStore.filter((f) => f.sentimentLabel === 'Positive').length,
    Neutral: feedbackStore.filter((f) => f.sentimentLabel === 'Neutral').length,
    Negative: feedbackStore.filter((f) => f.sentimentLabel === 'Negative').length,
  };

  const ecrStats = {
    total: ecrStore.length,
    windchillSynced: ecrStore.filter((e) => e.status === 'Windchill Synced').length,
    submitted: ecrStore.filter((e) => e.status === 'Submitted' || e.status === 'Under Review').length,
  };

  res.json({
    totalFeedback,
    criticalCount,
    avgSentiment,
    stageDistribution,
    sentimentBreakdown,
    ecrStats,
  });
});

// CSV Report Export API Endpoint
app.get('/api/reports/csv', (req: Request, res: Response) => {
  const type = (req.query.type as string) || 'feedback';

  if (type === 'ecr') {
    let csv = 'ECR Number,Title,Product,Component Code,PLM Stage,Priority,Status,Windchill ID,Created At\n';
    ecrStore.forEach((e) => {
      csv += `"${e.ecrNumber}","${e.title.replace(/"/g, '""')}","${e.productName}","${e.componentCode}","${e.plmStage}","${e.priority}","${e.status}","${e.windchillEcrNumber || 'N/A'}","${e.createdAt}"\n`;
    });
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="plm_ecrs_report.csv"');
    return res.send(csv);
  }

  // Default: Feedback CSV
  let csv = 'ID,Title,Customer,Email,Source,Product,Category,Priority,PLM Stage,Status,Sentiment Score,Sentiment Label,Date Submitted\n';
  feedbackStore.forEach((f) => {
    csv += `"${f.id}","${f.title.replace(/"/g, '""')}","${f.customerName}","${f.customerEmail}","${f.source}","${f.productName}","${f.category}","${f.priority}","${f.plmStage}","${f.status}",${f.sentimentScore},"${f.sentimentLabel}","${f.dateSubmitted}"\n`;
  });
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="customer_feedback_report.csv"');
  return res.send(csv);
});

// ----------------------------------------------------
// PRODUCTS & BOM APIs
// ----------------------------------------------------

// GET Products
app.get('/api/products', (_req: Request, res: Response) => {
  res.json(productsStore);
});

// GET Single Product
app.get('/api/products/:id', (req: Request, res: Response) => {
  const product = productsStore.find((p) => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found.' });
  }
  res.json(product);
});

// POST Create Product
app.post('/api/products', (req: Request, res: Response) => {
  const { name, code, version, category, lifecycleStage, description } = req.body;
  if (!name || !code) {
    return res.status(400).json({ error: 'Name and Code are required for a Product.' });
  }

  const newProduct: Product = {
    id: `prod-${Date.now().toString().slice(-4)}`,
    name,
    code,
    version: version || 'v1.0',
    category: category || 'Industrial Machinery',
    lifecycleStage: lifecycleStage || 'Requirement Gathering',
    description: description || 'New Enterprise Product Model',
    componentsCount: 0,
    activeECRsCount: 0,
    feedbackCount: 0,
    healthScore: 90,
  };

  productsStore.unshift(newProduct);
  res.status(201).json({ success: true, product: newProduct });
});

// GET BOM
app.get('/api/bom', (req: Request, res: Response) => {
  const productId = req.query.productId as string;
  if (productId) {
    const filtered = bomStore.filter((b) => b.productId === productId);
    return res.json(filtered);
  }
  res.json(bomStore);
});

// POST Add BOM Item
app.post('/api/bom', (req: Request, res: Response) => {
  const { productId, name, componentCode, revision, material, currentStage, status } = req.body;
  if (!productId || !name || !componentCode) {
    return res.status(400).json({ error: 'productId, name, and componentCode are required.' });
  }

  const newBom: ComponentBOM = {
    id: `bom-${Date.now().toString().slice(-4)}`,
    productId,
    name,
    componentCode,
    revision: revision || 'Rev A',
    material: material || 'Standard Alloy',
    currentStage: currentStage || 'Design',
    feedbackCount: 0,
    openIssuesCount: 0,
    status: status || 'Normal',
  };

  bomStore.push(newBom);
  res.status(201).json({ success: true, component: newBom });
});

// ----------------------------------------------------
// FEEDBACK CRUD APIs
// ----------------------------------------------------

// GET All Feedback with filtering
app.get('/api/feedback', (req: Request, res: Response) => {
  const { productId, category, priority, plmStage, status, search } = req.query;

  let list = [...feedbackStore];

  if (productId) {
    list = list.filter((f) => f.productId === productId);
  }
  if (category && category !== 'ALL') {
    list = list.filter((f) => f.category === category);
  }
  if (priority && priority !== 'ALL') {
    list = list.filter((f) => f.priority === priority);
  }
  if (plmStage && plmStage !== 'ALL') {
    list = list.filter((f) => f.plmStage === plmStage);
  }
  if (status && status !== 'ALL') {
    list = list.filter((f) => f.status === status);
  }
  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    list = list.filter(
      (f) =>
        f.title.toLowerCase().includes(q) ||
        f.content.toLowerCase().includes(q) ||
        f.customerName.toLowerCase().includes(q) ||
        f.productName.toLowerCase().includes(q) ||
        f.topics.some((t) => t.toLowerCase().includes(q))
    );
  }

  res.json(list);
});

// GET Single Feedback by ID
app.get('/api/feedback/:id', (req: Request, res: Response) => {
  const item = feedbackStore.find((f) => f.id === req.params.id);
  if (!item) {
    return res.status(404).json({ error: 'Feedback item not found.' });
  }
  res.json(item);
});

// POST Manual Feedback Submission
app.post('/api/feedback', (req: Request, res: Response) => {
  const { title, content, customerName, customerEmail, source, productId, productName, category, priority, plmStage } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required.' });
  }

  const newItem: FeedbackItem = {
    id: `fb-${Date.now().toString().slice(-4)}`,
    title,
    content,
    customerName: customerName || 'Enterprise Customer',
    customerEmail: customerEmail || 'customer@company.com',
    source: source || 'Direct Portal',
    dateSubmitted: new Date().toISOString().split('T')[0],
    status: 'Raw',
    productId: productId || 'prod-001',
    productName: productName || 'T-900 Industrial Turbine Assembly',
    sentimentScore: 0.0,
    sentimentLabel: 'Neutral',
    emotionBreakdown: { frustration: 20, disappointment: 20, satisfaction: 50, anger: 0, joy: 10 },
    topics: ['General Feedback'],
    keywords: ['manual', 'entry'],
    category: category || 'Usability Issue',
    priority: priority || 'Medium',
    plmStage: plmStage || 'Requirement Gathering',
  };

  feedbackStore.unshift(newItem);

  // Log Audit
  auditLogsStore.unshift({
    id: `log-${Date.now().toString().slice(-4)}`,
    timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
    user: 'User',
    role: 'Engineer',
    action: 'Feedback Submitted',
    targetModule: 'Feedback Hub',
    details: `Manually created feedback "${newItem.title}".`,
    ipAddress: '127.0.0.1',
  });

  res.status(201).json({ success: true, item: newItem });
});

// PUT Update Feedback Item
app.put('/api/feedback/:id', (req: Request, res: Response) => {
  const index = feedbackStore.findIndex((f) => f.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Feedback item not found.' });
  }

  feedbackStore[index] = {
    ...feedbackStore[index],
    ...req.body,
  };

  res.json({ success: true, item: feedbackStore[index] });
});

// DELETE Feedback Item
app.delete('/api/feedback/:id', (req: Request, res: Response) => {
  const index = feedbackStore.findIndex((f) => f.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Feedback item not found.' });
  }

  const removed = feedbackStore.splice(index, 1)[0];
  res.json({ success: true, message: `Feedback ${removed.id} deleted.`, item: removed });
});

// ----------------------------------------------------
// AI GEMINI NLP ANALYSIS API
// ----------------------------------------------------

app.post('/api/analyze-feedback', async (req: Request, res: Response) => {
  try {
    const { title, content, productName, source, customerName, customerEmail, productId } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Feedback content is required for analysis.' });
    }

    const ai = getGeminiClient();

    const prompt = `You are an expert Enterprise Product Lifecycle Management (PLM) and NLP Quality Engineer.
Analyze the following customer feedback for the product "${productName || 'Unassigned Product'}":

TITLE: ${title || 'Untitled Feedback'}
CONTENT: ${content}

Perform a deep structured analysis to help engineering and PLM teams map this issue into the Product Lifecycle.
Return a valid JSON object matching this schema EXACTLY:
{
  "sentimentScore": number (-1.0 to +1.0),
  "sentimentLabel": "Positive" | "Neutral" | "Negative",
  "emotionBreakdown": {
    "frustration": number (0-100),
    "disappointment": number (0-100),
    "satisfaction": number (0-100),
    "anger": number (0-100),
    "joy": number (0-100)
  },
  "topics": array of string (3-5 relevant domain engineering topics),
  "keywords": array of string (4-6 key terms),
  "category": "Complaint" | "Feature Request" | "Bug Report" | "Usability Issue" | "Performance" | "Quality Defect" | "Enhancement",
  "priority": "Critical" | "High" | "Medium" | "Low",
  "plmStage": "Requirement Gathering" | "Design" | "Development" | "Manufacturing" | "Quality" | "Testing" | "Release" | "Maintenance" | "Retirement",
  "isComplaint": boolean,
  "isFeatureRequest": boolean,
  "recommendation": {
    "title": string (Actionable engineering change recommendation title),
    "summary": string (Concise 1-2 sentence engineering change summary),
    "affectedComponent": string (Name of likely physical or electrical component affected),
    "componentCode": string (Suggested component code like COMP-XXX),
    "suggestedAction": string (Specific task for CAD/PLM/Quality team),
    "estimatedEffort": "Low (1-2 wks)" | "Medium (1 mo)" | "High (2-3 mos)",
    "riskImpact": "Low" | "Medium" | "High" | "Critical",
    "targetPLMStage": "Requirement Gathering" | "Design" | "Development" | "Manufacturing" | "Quality" | "Testing" | "Release" | "Maintenance" | "Retirement",
    "rationale": string (Technical justification)
  }
}`;

    const aiResponse = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sentimentScore: { type: Type.NUMBER },
            sentimentLabel: { type: Type.STRING },
            emotionBreakdown: {
              type: Type.OBJECT,
              properties: {
                frustration: { type: Type.NUMBER },
                disappointment: { type: Type.NUMBER },
                satisfaction: { type: Type.NUMBER },
                anger: { type: Type.NUMBER },
                joy: { type: Type.NUMBER },
              },
              required: ['frustration', 'disappointment', 'satisfaction', 'anger', 'joy'],
            },
            topics: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            keywords: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            category: { type: Type.STRING },
            priority: { type: Type.STRING },
            plmStage: { type: Type.STRING },
            isComplaint: { type: Type.BOOLEAN },
            isFeatureRequest: { type: Type.BOOLEAN },
            recommendation: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                summary: { type: Type.STRING },
                affectedComponent: { type: Type.STRING },
                componentCode: { type: Type.STRING },
                suggestedAction: { type: Type.STRING },
                estimatedEffort: { type: Type.STRING },
                riskImpact: { type: Type.STRING },
                targetPLMStage: { type: Type.STRING },
                rationale: { type: Type.STRING },
              },
              required: [
                'title',
                'summary',
                'affectedComponent',
                'componentCode',
                'suggestedAction',
                'estimatedEffort',
                'riskImpact',
                'targetPLMStage',
                'rationale',
              ],
            },
          },
          required: [
            'sentimentScore',
            'sentimentLabel',
            'emotionBreakdown',
            'topics',
            'keywords',
            'category',
            'priority',
            'plmStage',
            'recommendation',
          ],
        },
      },
    });

    const parsed = JSON.parse(aiResponse.text || '{}');

    // Create a new analyzed feedback item
    const newItem: FeedbackItem = {
      id: `fb-${Date.now().toString().slice(-4)}`,
      title: title || parsed.recommendation?.title || 'Customer Feedback Issue',
      content,
      customerName: customerName || 'Anonymous Customer',
      customerEmail: customerEmail || 'customer@enterprise-corp.com',
      source: source || 'Direct Portal',
      dateSubmitted: new Date().toISOString().split('T')[0],
      status: 'Analyzed',
      productId: productId || 'prod-001',
      productName: productName || 'T-900 Industrial Turbine Assembly',
      sentimentScore: parsed.sentimentScore ?? -0.5,
      sentimentLabel: parsed.sentimentLabel || 'Negative',
      emotionBreakdown: parsed.emotionBreakdown || {
        frustration: 70,
        disappointment: 50,
        satisfaction: 10,
        anger: 30,
        joy: 0,
      },
      topics: parsed.topics || ['Product Performance', 'Design Feedback'],
      keywords: parsed.keywords || ['thermal', 'vibration', 'wear'],
      category: parsed.category || 'Quality Defect',
      priority: parsed.priority || 'High',
      plmStage: parsed.plmStage || 'Manufacturing',
      engineeringRecommendation: parsed.recommendation
        ? {
            id: `rec-${Date.now().toString().slice(-4)}`,
            ...parsed.recommendation,
          }
        : undefined,
    };

    feedbackStore.unshift(newItem);

    // Audit log
    auditLogsStore.unshift({
      id: `log-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      user: 'AI Service (Gemini 3.6 Flash)',
      role: 'Admin',
      action: 'AI Feedback Analysis',
      targetModule: 'AI Pipeline',
      details: `Analyzed feedback "${newItem.title}" mapped to PLM Stage: ${newItem.plmStage}.`,
      ipAddress: '127.0.0.1',
    });

    return res.json({ success: true, item: newItem, rawAnalysis: parsed });
  } catch (error: any) {
    console.error('Error during AI analysis:', error);
    res.status(500).json({
      error: error.message || 'AI Analysis failed.',
      fallbackMessage: 'Verify that GEMINI_API_KEY is configured in Secrets panel.',
    });
  }
});

// POST Bulk Batch Import Endpoint
app.post('/api/feedback/batch', (req: Request, res: Response) => {
  const { items } = req.body;
  if (!Array.isArray(items)) {
    return res.status(400).json({ error: 'Items must be an array.' });
  }

  const added: FeedbackItem[] = [];
  items.forEach((item, index) => {
    const newItem: FeedbackItem = {
      id: `fb-b${Date.now().toString().slice(-3)}-${index}`,
      title: item.title || 'Uploaded Customer Feedback',
      content: item.content || '',
      customerName: item.customerName || 'Batch Import User',
      customerEmail: item.customerEmail || 'import@enterprise.com',
      source: 'CSV Upload',
      dateSubmitted: new Date().toISOString().split('T')[0],
      status: 'Raw',
      productId: item.productId || 'prod-001',
      productName: item.productName || 'T-900 Industrial Turbine Assembly',
      sentimentScore: item.sentimentScore ?? -0.2,
      sentimentLabel: item.sentimentLabel || 'Neutral',
      emotionBreakdown: item.emotionBreakdown || {
        frustration: 30,
        disappointment: 20,
        satisfaction: 40,
        anger: 10,
        joy: 10,
      },
      topics: item.topics || ['Imported Issue'],
      keywords: item.keywords || ['batch', 'feedback'],
      category: item.category || 'Complaint',
      priority: item.priority || 'Medium',
      plmStage: item.plmStage || 'Manufacturing',
    };
    feedbackStore.unshift(newItem);
    added.push(newItem);
  });

  res.json({ success: true, count: added.length, items: added });
});

// ----------------------------------------------------
// ENGINEERING CHANGE REQUEST (ECR) APIs
// ----------------------------------------------------

// GET ECR List
app.get('/api/ecr', (_req: Request, res: Response) => {
  res.json(ecrStore);
});

// GET Single ECR
app.get('/api/ecr/:id', (req: Request, res: Response) => {
  const ecr = ecrStore.find((e) => e.id === req.params.id);
  if (!ecr) {
    return res.status(404).json({ error: 'ECR not found.' });
  }
  res.json(ecr);
});

// POST Create ECR
app.post('/api/ecr', (req: Request, res: Response) => {
  const { feedbackId, title, productId, productName, componentCode, plmStage, priority, proposedChanges, createdBy } = req.body;

  const newEcr: EngineeringChangeRequest = {
    id: `ecr-${Date.now().toString().slice(-4)}`,
    ecrNumber: `ECR-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    title: title || 'Engineering Change Request',
    feedbackIds: feedbackId ? [feedbackId] : [],
    productId: productId || 'prod-001',
    productName: productName || 'T-900 Industrial Turbine Assembly',
    componentCode: componentCode || 'COMP-GEN-01',
    plmStage: plmStage || 'Design',
    priority: priority || 'High',
    status: 'Submitted',
    description: `Generated from Customer Feedback Analysis. Target PLM Stage: ${plmStage}`,
    proposedChanges: proposedChanges || 'Perform engineering review and update CAD/BOM specs.',
    engineeringImpact: 'Requires review by Design Lead and PLM Change Control Board.',
    createdBy: createdBy || 'Engineer',
    createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
  };

  ecrStore.unshift(newEcr);

  // Update referenced feedback item
  if (feedbackId) {
    const targetFb = feedbackStore.find((f) => f.id === feedbackId);
    if (targetFb) {
      targetFb.status = 'ECR Created';
      targetFb.ecrReference = {
        ecrId: newEcr.id,
        ecrNumber: newEcr.ecrNumber,
        status: newEcr.status,
      };
    }
  }

  // Audit
  auditLogsStore.unshift({
    id: `log-${Date.now().toString().slice(-4)}`,
    timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
    user: createdBy || 'Engineer',
    role: 'Engineer',
    action: 'ECR Created',
    targetModule: 'ECR Workflow',
    details: `Created Change Request ${newEcr.ecrNumber} for Product ${newEcr.productName}.`,
    ipAddress: '127.0.0.1',
  });

  res.status(201).json({ success: true, ecr: newEcr });
});

// PUT Update ECR
app.put('/api/ecr/:id', (req: Request, res: Response) => {
  const index = ecrStore.findIndex((e) => e.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'ECR not found.' });
  }

  ecrStore[index] = {
    ...ecrStore[index],
    ...req.body,
  };

  res.json({ success: true, ecr: ecrStore[index] });
});

// DELETE ECR
app.delete('/api/ecr/:id', (req: Request, res: Response) => {
  const index = ecrStore.findIndex((e) => e.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'ECR not found.' });
  }

  const removed = ecrStore.splice(index, 1)[0];
  res.json({ success: true, message: `ECR ${removed.ecrNumber} deleted.`, ecr: removed });
});

// ----------------------------------------------------
// PTC WINDCHILL PLM INTEGRATION APIs
// ----------------------------------------------------

// GET Windchill Config
app.get('/api/windchill/config', (_req: Request, res: Response) => {
  res.json(windchillConfigStore);
});

// PUT Update Windchill Config Settings
app.put('/api/windchill/config', (req: Request, res: Response) => {
  windchillConfigStore = {
    ...windchillConfigStore,
    ...req.body,
  };

  auditLogsStore.unshift({
    id: `log-${Date.now().toString().slice(-4)}`,
    timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
    user: 'Admin',
    role: 'Admin',
    action: 'Windchill Config Updated',
    targetModule: 'Integration Settings',
    details: `Updated Windchill base URL to ${windchillConfigStore.baseUrl}.`,
    ipAddress: '127.0.0.1',
  });

  res.json({ success: true, config: windchillConfigStore });
});

// GET Preview Windchill REST API Payload for an ECR
app.get('/api/windchill/payload/:ecrId', (req: Request, res: Response) => {
  const ecr = ecrStore.find((e) => e.id === req.params.ecrId);
  if (!ecr) {
    return res.status(404).json({ error: 'ECR not found for payload preview.' });
  }

  const payload = {
    ptcWindchillObject: 'wt.change2.WTChangeRequest2',
    apiVersion: 'v1.0/ChangeManagement',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer [ENCRYPTED_PTC_OAUTH_TOKEN]',
      'X-Windchill-Context': 'Container/Product/IndustrialMachinery',
    },
    body: {
      Name: ecr.title,
      Number: ecr.windchillEcrNumber || `AUTOGEN-${ecr.ecrNumber}`,
      Category: 'Customer Feedback Driven Change',
      Priority: ecr.priority.toUpperCase(),
      LifeCycleState: 'UNDER_REVIEW',
      AffectedItems: [
        {
          Number: ecr.componentCode,
          Type: 'wt.part.WTPart',
          ActionNeeded: 'Update CAD Geometry & BOM Structure',
        },
      ],
      Description: ecr.description,
      ProposedSolution: ecr.proposedChanges,
      CustomAttributes: {
        SourceFeedbackIds: ecr.feedbackIds.join(','),
        AIConfidenceIndex: 0.96,
        PLMStage: ecr.plmStage,
      },
    },
  };

  res.json({ success: true, ecrId: ecr.id, payload });
});

// POST Windchill Sync
app.post('/api/windchill/sync', (req: Request, res: Response) => {
  const { action, ecrId } = req.body;

  if (action === 'sync_ecr' && ecrId) {
    const ecr = ecrStore.find((e) => e.id === ecrId);
    if (ecr) {
      ecr.status = 'Windchill Synced';
      ecr.windchillEcrNumber = ecr.windchillEcrNumber || `PTC-WC-ECR-${Math.floor(100000 + Math.random() * 900000)}`;
      ecr.windchillSyncTime = new Date().toISOString().replace('T', ' ').slice(0, 19);
      windchillConfigStore.syncedECRsCount += 1;
      windchillConfigStore.lastSyncTime = new Date().toISOString().replace('T', ' ').slice(0, 19);

      // Audit
      auditLogsStore.unshift({
        id: `log-${Date.now().toString().slice(-4)}`,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        user: 'Engineer',
        role: 'Engineer',
        action: 'Windchill ECR Sync',
        targetModule: 'Windchill Integration',
        details: `Pushed ECR ${ecr.ecrNumber} to Windchill PLM (Assigned WC ID: ${ecr.windchillEcrNumber}).`,
        ipAddress: '127.0.0.1',
      });

      return res.json({ success: true, ecr, windchillConfig: windchillConfigStore });
    }
  }

  // Full system sync
  windchillConfigStore.status = 'Connected';
  windchillConfigStore.lastSyncTime = new Date().toISOString().replace('T', ' ').slice(0, 19);

  res.json({
    success: true,
    message: 'PTC Windchill PLM REST Server connection verified and bi-directional sync completed.',
    config: windchillConfigStore,
  });
});

// ----------------------------------------------------
// AUDIT LOGS APIs
// ----------------------------------------------------

// GET Audit Logs
app.get('/api/audit', (_req: Request, res: Response) => {
  res.json(auditLogsStore);
});

// POST Record Custom Audit Log
app.post('/api/audit', (req: Request, res: Response) => {
  const { user, role, action, targetModule, details } = req.body;

  const newLog: AuditLog = {
    id: `log-${Date.now().toString().slice(-4)}`,
    timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
    user: user || 'System User',
    role: role || 'Viewer',
    action: action || 'User Action',
    targetModule: targetModule || 'General System',
    details: details || 'Activity performed in PLM suite.',
    ipAddress: '127.0.0.1',
  };

  auditLogsStore.unshift(newLog);
  res.status(201).json({ success: true, log: newLog });
});

// ----------------------------------------------------
// PROJECT DOWNLOAD / EXPORT ZIP API
// ----------------------------------------------------
app.get(['/api/download/project.zip', '/api/download-zip'], (_req: Request, res: Response) => {
  try {
    const scriptPath = path.join(process.cwd(), 'scripts', 'package_project.py');
    const targetZip = path.join(process.cwd(), 'public', 'downloads', 'plm-feedback-intelligence.zip');

    try {
      execSync(`python3 "${scriptPath}" "${targetZip}"`);
    } catch (e) {
      console.warn('Could not re-run python packaging script, checking for existing zip...', e);
    }

    if (fs.existsSync(targetZip)) {
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', 'attachment; filename="plm-feedback-intelligence.zip"');
      res.setHeader('Cache-Control', 'no-cache');
      return res.sendFile(targetZip);
    }

    return res.status(500).json({ error: 'Could not generate archive.' });
  } catch (err: any) {
    console.error('Error generating project zip:', err);
    return res.status(500).json({ error: 'Failed to download project zip' });
  }
});

// ----------------------------------------------------
// VITE MIDDLEWARE SETUP
// ----------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n==================================================`);
    console.log(`🚀 [PLM AI Application] Full-stack Server Running!`);
    console.log(`  ➜ Local:   http://localhost:${PORT}`);
    console.log(`  ➜ Network: http://127.0.0.1:${PORT}`);
    console.log(`  (Note: Open http://localhost:${PORT} in your browser)`);
    console.log(`==================================================\n`);
  });
}

startServer();

