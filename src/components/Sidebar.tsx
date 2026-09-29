import React from 'react';
import {
  LayoutDashboard,
  MessageSquareText,
  UploadCloud,
  BrainCircuit,
  Lightbulb,
  Boxes,
  Workflow,
  FileSpreadsheet,
  FileCode2,
  Settings,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  feedbackCount: number;
  ecrCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  feedbackCount,
  ecrCount,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
    { id: 'feedback', label: 'Customer Feedback Hub', icon: MessageSquareText, badge: feedbackCount },
    { id: 'upload', label: 'Ingestion & Upload', icon: UploadCloud },
    { id: 'ai-pipeline', label: 'AI Pipeline Debugger', icon: BrainCircuit },
    { id: 'ecr', label: 'Recommendations & ECRs', icon: Lightbulb, badge: ecrCount },
    { id: 'plm', label: 'PLM Lifecycle & BOM', icon: Boxes },
    { id: 'windchill', label: 'PTC Windchill Connector', icon: Workflow },
    { id: 'reports', label: 'Reports & Analytics Export', icon: FileSpreadsheet },
    { id: 'architecture', label: 'Architecture & Diagrams', icon: FileCode2 },
    { id: 'settings', label: 'RBAC & Audit Logs', icon: Settings },
  ];

  return (
    <aside className="w-64 shrink-0 hidden md:block border-r border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-[#111114] p-3 min-h-[calc(100vh-61px)]">
      <div className="space-y-1">
        <p className="px-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
          PLM Operational Modules
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className={`px-2 py-0.5 text-[10px] rounded-full font-bold ${
                    isActive
                      ? 'bg-indigo-500/20 text-indigo-300'
                      : 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/40'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-8 p-3 rounded-xl bg-[#18181b] border border-white/5">
        <div className="flex items-center gap-2 mb-1.5">
          <BrainCircuit className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-bold text-slate-900 dark:text-white">Gemini 3.6 Flash</span>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
          Server-side NLP Engine actively mapping feedback to PLM stages & generating ECRs.
        </p>
      </div>
    </aside>
  );
};
