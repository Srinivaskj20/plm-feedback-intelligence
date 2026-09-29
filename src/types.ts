export type UserRole = 'Admin' | 'Manager' | 'Engineer' | 'Customer';

export type PLMStage =
  | 'Requirement Gathering'
  | 'Design'
  | 'Development'
  | 'Manufacturing'
  | 'Quality'
  | 'Testing'
  | 'Release'
  | 'Maintenance'
  | 'Retirement';

export type FeedbackCategory =
  | 'Complaint'
  | 'Feature Request'
  | 'Bug Report'
  | 'Usability Issue'
  | 'Performance'
  | 'Quality Defect'
  | 'Enhancement'
  | 'Maintenance';

export type PriorityLevel = 'Critical' | 'High' | 'Medium' | 'Low';

export type SentimentType = 'Positive' | 'Neutral' | 'Negative';

export interface EmotionBreakdown {
  frustration: number; // 0 - 100
  disappointment: number; // 0 - 100
  satisfaction: number; // 0 - 100
  anger: number; // 0 - 100
  joy: number; // 0 - 100
}

export interface EngineeringRecommendation {
  id: string;
  title: string;
  summary: string;
  affectedComponent: string;
  componentCode: string;
  suggestedAction: string;
  estimatedEffort: 'Low (1-2 wks)' | 'Medium (1 mo)' | 'High (2-3 mos)';
  riskImpact: 'Low' | 'Medium' | 'High' | 'Critical';
  targetPLMStage: PLMStage;
  rationale: string;
}

export interface FeedbackItem {
  id: string;
  title: string;
  content: string;
  customerName: string;
  customerEmail: string;
  source: 'Direct Portal' | 'CSV Upload' | 'CRM Import' | 'Email Support' | 'Windchill Connector';
  dateSubmitted: string;
  status: 'Raw' | 'Analyzed' | 'In Review' | 'ECR Created' | 'Resolved' | 'Archived';
  productId: string;
  productName: string;
  sentimentScore: number; // -1.0 to +1.0
  sentimentLabel: SentimentType;
  emotionBreakdown: EmotionBreakdown;
  topics: string[];
  keywords: string[];
  category: FeedbackCategory;
  priority: PriorityLevel;
  plmStage: PLMStage;
  engineeringRecommendation?: EngineeringRecommendation;
  duplicateGroupId?: string;
  isDuplicate?: boolean;
  duplicateCount?: number;
  ecrReference?: {
    ecrId: string;
    ecrNumber: string;
    status: 'Draft' | 'Submitted' | 'Windchill Synced' | 'Under Review' | 'Approved' | 'Rejected';
  };
}

export interface Product {
  id: string;
  name: string;
  code: string;
  version: string;
  lifecycleStage: PLMStage;
  description: string;
  componentsCount: number;
  activeECRsCount: number;
  feedbackCount: number;
  healthScore: number; // 0 - 100
  category: string;
}

export interface ComponentBOM {
  id: string;
  productId: string;
  componentCode: string;
  name: string;
  revision: string;
  material: string;
  currentStage: PLMStage;
  feedbackCount: number;
  openIssuesCount: number;
  status: 'Normal' | 'Under Review' | 'Redesign Required' | 'Deprecating';
}

export interface EngineeringChangeRequest {
  id: string;
  ecrNumber: string; // e.g., ECR-2026-8841
  title: string;
  feedbackIds: string[];
  productId: string;
  productName: string;
  componentCode: string;
  plmStage: PLMStage;
  priority: PriorityLevel;
  status: 'Draft' | 'Submitted' | 'Windchill Synced' | 'Under Review' | 'Approved' | 'Rejected';
  description: string;
  proposedChanges: string;
  engineeringImpact: string;
  createdBy: string;
  createdAt: string;
  windchillEcrNumber?: string;
  windchillSyncTime?: string;
}

export interface WindchillConfig {
  baseUrl: string;
  clientAppId: string;
  environment: 'Production' | 'Staging' | 'Sandbox Mock';
  status: 'Connected' | 'Disconnected' | 'Syncing' | 'Error';
  lastSyncTime: string;
  autoSyncECR: boolean;
  restEndpoint: string;
  authMethod: 'OAuth 2.0' | 'API Key' | 'Basic Auth';
  syncedProductsCount: number;
  syncedECRsCount: number;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  role: UserRole;
  action: string;
  targetModule: string;
  details: string;
  ipAddress: string;
}

export interface AIAnalysisPipelineResult {
  sentimentScore: number;
  sentimentLabel: SentimentType;
  emotionBreakdown: EmotionBreakdown;
  topics: string[];
  keywords: string[];
  category: FeedbackCategory;
  priority: PriorityLevel;
  plmStage: PLMStage;
  isComplaint: boolean;
  isFeatureRequest: boolean;
  recommendation: EngineeringRecommendation;
  duplicateConfidence: number; // 0 - 100
  suggestedDuplicateId?: string;
}
