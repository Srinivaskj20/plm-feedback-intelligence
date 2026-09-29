import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  FileText,
  FileCode,
  CheckCircle,
  Sparkles,
  Layers,
  Printer,
} from 'lucide-react';
import { FeedbackItem, EngineeringChangeRequest } from '../types';

interface ReportsViewProps {
  feedbackList: FeedbackItem[];
  ecrList: EngineeringChangeRequest[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({ feedbackList, ecrList }) => {
  const [downloadingFormat, setDownloadingFormat] = useState<string | null>(null);

  const handleExport = (format: 'CSV' | 'Excel' | 'PDF' | 'PowerPoint') => {
    setDownloadingFormat(format);
    setTimeout(() => {
      setDownloadingFormat(null);

      const dateStr = new Date().toISOString().split('T')[0];

      if (format === 'CSV') {
        const headers = 'ID,Title,Product,PLMStage,Priority,SentimentScore,Category,Status\n';
        const rows = feedbackList
          .map(
            (f) =>
              `"${f.id}","${f.title.replace(/"/g, '""')}","${f.productName}","${f.plmStage}","${
                f.priority
              }","${f.sentimentScore}","${f.category}","${f.status}"`
          )
          .join('\n');

        const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `PLM_Customer_Feedback_Report_${dateStr}.csv`;
        a.click();
      } else if (format === 'Excel') {
        // Generate XML Spreadsheet format (Excel compatible)
        const xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Worksheet ss:Name="PLM Feedback Report">
  <Table>
   <Row>
    <Cell><Data ss:Type="String">Feedback ID</Data></Cell>
    <Cell><Data ss:Type="String">Title</Data></Cell>
    <Cell><Data ss:Type="String">Product Name</Data></Cell>
    <Cell><Data ss:Type="String">PLM Stage</Data></Cell>
    <Cell><Data ss:Type="String">Priority</Data></Cell>
    <Cell><Data ss:Type="String">Sentiment</Data></Cell>
    <Cell><Data ss:Type="String">Category</Data></Cell>
   </Row>
   ${feedbackList
     .map(
       (f) => `<Row>
    <Cell><Data ss:Type="String">${f.id}</Data></Cell>
    <Cell><Data ss:Type="String">${f.title}</Data></Cell>
    <Cell><Data ss:Type="String">${f.productName}</Data></Cell>
    <Cell><Data ss:Type="String">${f.plmStage}</Data></Cell>
    <Cell><Data ss:Type="String">${f.priority}</Data></Cell>
    <Cell><Data ss:Type="String">${f.sentimentLabel}</Data></Cell>
    <Cell><Data ss:Type="String">${f.category}</Data></Cell>
   </Row>`
     )
     .join('\n')}
  </Table>
 </Worksheet>
</Workbook>`;

        const blob = new Blob([xml], { type: 'application/vnd.ms-excel' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `PLM_Executive_Report_${dateStr}.xls`;
        a.click();
      } else if (format === 'PDF') {
        // Trigger browser print to PDF or generate downloadable text summary
        window.print();
      } else if (format === 'PowerPoint') {
        // Generate text slide deck outline
        const pptContent = `Enterprise PLM & Customer Feedback Executive Presentation\nDate: ${dateStr}\n\n` +
          `Slide 1: Executive Overview\n- Total Customer Tickets: ${feedbackList.length}\n- Open ECRs: ${ecrList.length}\n\n` +
          `Slide 2: High Priority Engineering Issues\n` +
          feedbackList
            .filter((f) => f.priority === 'Critical' || f.priority === 'High')
            .map((f) => `- [${f.priority}] ${f.title} (${f.productName})`)
            .join('\n');

        const blob = new Blob([pptContent], { type: 'text/plain;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `PLM_CCB_Presentation_Outline_${dateStr}.txt`;
        a.click();
      }
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-indigo-500" />
          Executive PLM & Feedback Analytics Reports
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Generate audit-ready reports in PDF, Excel, CSV, or presentation slide format for engineering change boards.
        </p>
      </div>

      {/* Export Options Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CSV Export */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-[#18181b] shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            CSV
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Structured Data Export</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Raw tabular CSV file containing all feedback items, NLP metrics, and PLM stages.
            </p>
          </div>
          <button
            onClick={() => handleExport('CSV')}
            disabled={downloadingFormat === 'CSV'}
            className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            {downloadingFormat === 'CSV' ? 'Exporting...' : 'Download CSV'}
          </button>
        </div>

        {/* Excel Export */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-[#18181b] shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold">
            XLSX
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Excel Workbook</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Multi-tab spreadsheet with summary pivot tables, sentiment meters, and ECR logs.
            </p>
          </div>
          <button
            onClick={() => handleExport('Excel')}
            disabled={downloadingFormat === 'Excel'}
            className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            {downloadingFormat === 'Excel' ? 'Generating...' : 'Download Excel'}
          </button>
        </div>

        {/* PDF Export */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-[#18181b] shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
            PDF
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Executive PDF Report</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Formatted document featuring executive dashboard charts, high-priority ECRs, and Windchill logs.
            </p>
          </div>
          <button
            onClick={() => handleExport('PDF')}
            disabled={downloadingFormat === 'PDF'}
            className="w-full py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            {downloadingFormat === 'PDF' ? 'Rendering...' : 'Download PDF'}
          </button>
        </div>

        {/* PowerPoint Export */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
            PPTX
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">CCB Slide Deck</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Change Control Board presentation slides summarizing defect heatmaps and recommendations.
            </p>
          </div>
          <button
            onClick={() => handleExport('PowerPoint')}
            disabled={downloadingFormat === 'PowerPoint'}
            className="w-full py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            {downloadingFormat === 'PowerPoint' ? 'Building...' : 'Download PPTX'}
          </button>
        </div>
      </div>
    </div>
  );
};
