import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import {
  UploadCloud,
  Sparkles,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  Send,
  Loader2,
  Cpu,
  Download,
  FileText,
  Trash2,
} from 'lucide-react';
import { FeedbackItem, Product } from '../types';

interface UploadIngestionViewProps {
  products: Product[];
  onAnalysisSuccess: (newItem: FeedbackItem) => void;
  onBatchSuccess: (items: FeedbackItem[]) => void;
}

export const UploadIngestionView: React.FC<UploadIngestionViewProps> = ({
  products,
  onAnalysisSuccess,
  onBatchSuccess,
}) => {
  const [activeMode, setActiveMode] = useState<'single' | 'batch'>('single');

  // Single AI Analysis Form State
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || 'prod-001');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [source, setSource] = useState<'Direct Portal' | 'CSV Upload' | 'CRM Import' | 'Email Support' | 'Windchill Connector'>('Direct Portal');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<FeedbackItem | null>(null);

  // Batch Upload States
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [parsedPreview, setParsedPreview] = useState<Partial<FeedbackItem>[]>([]);
  const [batchError, setBatchError] = useState<string | null>(null);
  const [isProcessingBatch, setIsProcessingBatch] = useState(false);
  const [batchSuccessMsg, setBatchSuccessMsg] = useState<string | null>(null);

  // Sample templates for instant testing
  const sampleTemplates = [
    {
      title: 'Cooling fluid leakage under high pressure vibration',
      content:
        'Operators at the energy grid testing bay noted micro-drops of coolant leaking around the intake manifold flange on the T-900 Turbine during 120Hz acoustic vibration testing. Gasket material silicone sealant appears to liquefy under chemical exposure.',
      productName: 'T-900 Industrial Turbine Assembly',
    },
    {
      title: 'Infusion pump battery drainage in standby mode',
      content:
        'Biomedical engineers noted the Mark-IV internal battery depletes from 100% to 15% within 24 hours of idle standby. The wireless IoT beacon remains at peak power output constantly instead of entering sleep mode.',
      productName: 'Smart Infusion Pump Mark-IV',
    },
    {
      title: 'Inverter ECU CAN-bus message drop during regenerative braking',
      content:
        'High electromagnetic interference (EMI) from the SiC gate driver triggers a CAN bus frame error every 45 seconds during maximum deceleration, temporarily masking wheel speed telemetry.',
      productName: 'Electric Powertrain ECU-v3',
    },
  ];

  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysisResult(null);

    const targetProduct = products.find((p) => p.id === selectedProductId);

    try {
      const res = await fetch('/api/analyze-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          productId: selectedProductId,
          productName: targetProduct?.name || 'T-900 Industrial Turbine Assembly',
          source,
          customerName: customerName || 'Customer Engineer',
          customerEmail: customerEmail || 'engineer@enterprise.com',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'AI Analysis failed.');
      }

      setAnalysisResult(data.item);
      onAnalysisSuccess(data.item);
      setTitle('');
      setContent('');
    } catch (err: any) {
      console.error(err);
      setAnalysisError(err.message || 'Error executing Gemini AI analysis pipeline.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApplySample = (sample: (typeof sampleTemplates)[0]) => {
    setTitle(sample.title);
    setContent(sample.content);
  };

  // -----------------------------------------------------------
  // FILE UPLODAD & PARSING HANDLERS
  // -----------------------------------------------------------

  const processFile = (file: File) => {
    setBatchError(null);
    setBatchSuccessMsg(null);
    setUploadedFile(file);

    const ext = file.name.split('.').pop()?.toLowerCase();

    if (ext === 'csv') {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            console.warn('CSV Parse Warnings:', results.errors);
          }

          const rawRows = results.data as Record<string, any>[];
          if (!rawRows || rawRows.length === 0) {
            setBatchError('The uploaded CSV file is empty.');
            setParsedPreview([]);
            return;
          }

          // Map CSV columns flexibly
          const formattedItems: Partial<FeedbackItem>[] = rawRows.map((row, idx) => {
            const rowTitle = row.title || row.Title || row.subject || row.Subject || `Feedback Row ${idx + 1}`;
            const rowContent =
              row.content || row.Content || row.text || row.Text || row.description || row.Description || row.comment || row.Comment || 'No detailed content provided.';
            const rowCustomer = row.customerName || row.customer || row.Name || row.reporter || 'Field Operator';
            const rowEmail = row.customerEmail || row.email || row.Email || 'field.operator@enterprise.com';
            const rowProduct = row.productName || row.product || row.Product || products[0]?.name || 'T-900 Industrial Turbine Assembly';
            const rowCategory = row.category || row.Category || 'Usability Issue';
            const rowPriority = row.priority || row.Priority || 'Medium';
            const rowPlmStage = row.plmStage || row.stage || 'Requirement Gathering';

            return {
              title: rowTitle,
              content: rowContent,
              customerName: rowCustomer,
              customerEmail: rowEmail,
              productName: rowProduct,
              source: 'CSV Upload',
              category: rowCategory,
              priority: rowPriority as any,
              plmStage: rowPlmStage as any,
            };
          });

          setParsedPreview(formattedItems);
        },
        error: (err) => {
          setBatchError(`CSV Parse Error: ${err.message}`);
        },
      });
    } else if (ext === 'json') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const json = JSON.parse(text);
          const array = Array.isArray(json) ? json : [json];

          const formattedItems: Partial<FeedbackItem>[] = array.map((row, idx) => ({
            title: row.title || row.Title || `JSON Feedback #${idx + 1}`,
            content: row.content || row.text || row.description || 'No description provided.',
            customerName: row.customerName || row.customer || 'Enterprise Client',
            customerEmail: row.customerEmail || row.email || 'client@enterprise.com',
            productName: row.productName || row.product || products[0]?.name || 'T-900 Industrial Turbine Assembly',
            source: 'CRM Import',
            category: row.category || 'Quality Incident',
            priority: row.priority || 'Medium',
            plmStage: row.plmStage || 'Requirement Gathering',
          }));

          setParsedPreview(formattedItems);
        } catch (err: any) {
          setBatchError(`Invalid JSON structure: ${err.message}`);
        }
      };
      reader.readAsText(file);
    } else if (ext === 'txt') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0);

        const formattedItems: Partial<FeedbackItem>[] = paragraphs.map((p, idx) => {
          const lines = p.trim().split('\n');
          return {
            title: lines[0].substring(0, 80) || `Text Observation #${idx + 1}`,
            content: p.trim(),
            customerName: 'Log Collector',
            customerEmail: 'logs@enterprise.com',
            productName: products[0]?.name || 'T-900 Industrial Turbine Assembly',
            source: 'Direct Portal',
            category: 'Usability Issue',
            priority: 'Medium',
            plmStage: 'Requirement Gathering',
          };
        });

        setParsedPreview(formattedItems);
      };
      reader.readAsText(file);
    } else {
      setBatchError('Unsupported file type. Please upload a .csv, .json, or .txt file.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleUploadBatchToApi = async () => {
    if (parsedPreview.length === 0) return;

    setIsProcessingBatch(true);
    setBatchError(null);
    setBatchSuccessMsg(null);

    try {
      const res = await fetch('/api/feedback/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: parsedPreview }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to import batch records.');
      }

      setBatchSuccessMsg(`Successfully imported ${data.count} customer feedback records into the PLM suite!`);
      onBatchSuccess(data.items);
      setUploadedFile(null);
      setParsedPreview([]);
    } catch (err: any) {
      setBatchError(err.message || 'An error occurred during batch ingestion.');
    } finally {
      setIsProcessingBatch(false);
    }
  };

  const handleDownloadTemplate = () => {
    const headers = 'title,content,customerName,customerEmail,productName,category,priority,plmStage\n';
    const sampleRows =
      '"Turbine vibration at 120Hz","Cooling fluid leaking near flange during acoustic vibration testing at bay 4","Dr. Alex Mercer","alex.mercer@energy.com","T-900 Industrial Turbine Assembly","Quality Incident","Critical","Design & Engineering"\n' +
      '"Infusion pump battery rapid discharge","Standby power drain drops battery by 85% in 24 hours without active pump cycles","Elena Vance","elena.vance@medtech.org","Smart Infusion Pump Mark-IV","Usability Issue","High","Requirement Gathering"\n' +
      '"CAN-bus EMI interference","ECU drops wheel telemetry frames on maximum brake regen deceleration","Marcus Kane","marcus.kane@evsys.io","Electric Powertrain ECU-v3","Component Defect","High","Quality Assurance & Testing"\n';

    const blob = new Blob([headers + sampleRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'PLM_Customer_Feedback_Import_Template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <UploadCloud className="w-5 h-5 text-indigo-500" />
          Feedback Ingestion & AI NLP Pipeline
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Ingest raw customer tickets or upload batch datasets to trigger the 12-step Gemini NLP analysis and PLM stage classifier.
        </p>
      </div>

      {/* Mode Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveMode('single')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeMode === 'single'
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Cpu className="w-4 h-4" />
          Real-Time AI Analyzer
        </button>
        <button
          onClick={() => setActiveMode('batch')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeMode === 'batch'
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          Batch CSV / Excel / JSON Upload
        </button>
      </div>

      {activeMode === 'single' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Input Form */}
          <div className="lg:col-span-2 p-6 rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-[#18181b] shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Submit Ticket for Gemini 3.6 Flash Analysis
            </h3>

            <form onSubmit={handleSingleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Select Target Product
                  </label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="w-full py-2 px-3 text-xs rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#111114] text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Feedback Source
                  </label>
                  <select
                    value={source}
                    onChange={(e) => setSource(e.target.value as any)}
                    className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Direct Portal">Direct Portal</option>
                    <option value="CSV Upload">CSV Upload</option>
                    <option value="CRM Import">CRM Import</option>
                    <option value="Email Support">Email Support</option>
                    <option value="Windchill Connector">Windchill Connector</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Customer / Reporter Name
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Dr. Alex Mercer"
                    className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Customer Email
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="alex.mercer@enterprise.com"
                    className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Issue Summary Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Thermal stress cracking on rotor blade during 850C test"
                  className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Customer Feedback Text / Field Observations
                </label>
                <textarea
                  rows={5}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Describe the defect, operating conditions, customer complaint, or feature request in detail..."
                  className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {analysisError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{analysisError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isAnalyzing || !content.trim()}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs transition-all shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Running Gemini 3.6 Flash PLM Classifier...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Run AI Analysis & Map to PLM Lifecycle
                  </>
                )}
              </button>
            </form>

            {analysisResult && (
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  AI Analysis Pipeline Executed Successfully!
                </div>
                <p className="text-slate-700 dark:text-slate-300">
                  Mapped to PLM Stage: <strong className="text-indigo-600 dark:text-indigo-400">{analysisResult.plmStage}</strong> | Priority: <strong>{analysisResult.priority}</strong>
                </p>
                <p className="text-slate-600 dark:text-slate-400 font-sans">
                  Recommendation: {analysisResult.engineeringRecommendation?.title}
                </p>
              </div>
            )}
          </div>

          {/* Right: Quick Sample Templates */}
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Quick Sample Enterprise Tickets
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Click any sample scenario to populate the analysis form instantly.
            </p>

            <div className="space-y-3">
              {sampleTemplates.map((tmpl, index) => (
                <div
                  key={index}
                  onClick={() => handleApplySample(tmpl)}
                  className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 hover:border-indigo-200 dark:hover:border-indigo-800 transition-all cursor-pointer space-y-1"
                >
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{tmpl.title}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2">{tmpl.content}</p>
                  <span className="inline-block text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 mt-1">
                    Product: {tmpl.productName}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Batch CSV / JSON Upload Mode */
        <div className="space-y-6 max-w-4xl mx-auto">
          {/* Hidden HTML File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".csv,.json,.txt"
            className="hidden"
          />

          {/* Drag & Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`p-8 rounded-2xl border-2 border-dashed transition-all text-center space-y-4 cursor-pointer ${
              isDragging
                ? 'border-indigo-500 bg-indigo-500/10'
                : 'border-slate-300 dark:border-white/10 bg-white dark:bg-[#18181b] hover:border-indigo-400 dark:hover:border-indigo-500/50'
            }`}
          >
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
              <UploadCloud className="w-8 h-8 animate-bounce" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Drag & Drop Feedback CSV, JSON, or TXT File
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Click here or drop your file directly to parse customer tickets instantly.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-sm shadow-indigo-600/20 flex items-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                Browse Files
              </button>
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Download CSV Template
              </button>
            </div>
          </div>

          {/* Error Message */}
          {batchError && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-600 dark:text-rose-400 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{batchError}</span>
              </div>
            </div>
          )}

          {/* Success Message */}
          {batchSuccessMsg && (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{batchSuccessMsg}</span>
            </div>
          )}

          {/* File Uploaded & Parsed Records Table Preview */}
          {uploadedFile && parsedPreview.length > 0 && (
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-[#18181b] shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
                    {uploadedFile.name.split('.').pop()?.toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{uploadedFile.name}</h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      {(uploadedFile.size / 1024).toFixed(1)} KB • {parsedPreview.length} items parsed ready for ingestion
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setUploadedFile(null);
                      setParsedPreview([]);
                    }}
                    className="p-2 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 hover:text-rose-500 transition-all text-xs"
                    title="Remove file"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleUploadBatchToApi}
                    disabled={isProcessingBatch}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 flex items-center gap-2 cursor-pointer"
                  >
                    {isProcessingBatch ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Ingesting Batch...
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-3.5 h-3.5" />
                        Confirm Import ({parsedPreview.length} Records)
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Table Preview */}
              <div className="overflow-x-auto max-h-64">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-[#111114] text-slate-500 dark:text-slate-400 font-semibold sticky top-0">
                    <tr>
                      <th className="py-2 px-3">#</th>
                      <th className="py-2 px-3">Title</th>
                      <th className="py-2 px-3">Product</th>
                      <th className="py-2 px-3">Customer</th>
                      <th className="py-2 px-3">Category</th>
                      <th className="py-2 px-3">Priority</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-slate-700 dark:text-slate-300">
                    {parsedPreview.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-white/5">
                        <td className="py-2 px-3 text-slate-400 font-mono text-[10px]">{idx + 1}</td>
                        <td className="py-2 px-3 font-semibold max-w-xs truncate">{item.title}</td>
                        <td className="py-2 px-3 text-slate-500 dark:text-slate-400">{item.productName}</td>
                        <td className="py-2 px-3 text-slate-500 dark:text-slate-400">{item.customerName}</td>
                        <td className="py-2 px-3">{item.category}</td>
                        <td className="py-2 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              item.priority === 'Critical'
                                ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400'
                                : item.priority === 'High'
                                ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            {item.priority || 'Medium'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

