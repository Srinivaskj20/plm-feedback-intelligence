import React, { useState } from 'react';
import {
  Lightbulb,
  Workflow,
  CheckCircle,
  Clock,
  Send,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Plus,
} from 'lucide-react';
import { EngineeringChangeRequest, WindchillConfig } from '../types';

interface RecommendationECRViewProps {
  ecrList: EngineeringChangeRequest[];
  windchillConfig: WindchillConfig;
  onSyncECR: (ecrId: string) => void;
  isSyncing: boolean;
}

export const RecommendationECRView: React.FC<RecommendationECRViewProps> = ({
  ecrList,
  windchillConfig,
  onSyncECR,
  isSyncing,
}) => {
  const [selectedECR, setSelectedECR] = useState<EngineeringChangeRequest | null>(
    ecrList[0] || null
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-indigo-500" />
            Engineering Change Requests (ECR) Workspace
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Review AI recommendations and push validated Engineering Change Requests directly to PTC Windchill PLM REST Server.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5">
            <Workflow className="w-4 h-4 text-indigo-500" />
            Windchill Status: <span className="text-emerald-600 dark:text-emerald-400 font-bold">{windchillConfig.status}</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: ECR List */}
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-[#18181b] shadow-sm space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Active ECR Queue ({ecrList.length})
          </h3>

          <div className="space-y-2">
            {ecrList.map((ecr) => {
              const isSelected = selectedECR?.id === ecr.id;
              return (
                <div
                  key={ecr.id}
                  onClick={() => setSelectedECR(ecr)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer space-y-1.5 ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 shadow-sm'
                      : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {ecr.ecrNumber}
                    </span>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                        ecr.status === 'Windchill Synced'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {ecr.status}
                    </span>
                  </div>

                  <p className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                    {ecr.title}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                    <span>{ecr.productName}</span>
                    <span>Stage: {ecr.plmStage}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected ECR Details & Windchill REST Push Controls */}
        {selectedECR ? (
          <div className="lg:col-span-2 p-6 rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-[#18181b] shadow-sm space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950">
                    {selectedECR.ecrNumber}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Target PLM Stage: {selectedECR.plmStage}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {selectedECR.title}
                </h3>
              </div>

              {selectedECR.status !== 'Windchill Synced' ? (
                <button
                  onClick={() => onSyncECR(selectedECR.id)}
                  disabled={isSyncing}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 flex items-center gap-2 shrink-0"
                >
                  <Workflow className="w-4 h-4" />
                  <span>{isSyncing ? 'Pushing REST Payload...' : 'Push to PTC Windchill REST'}</span>
                </button>
              ) : (
                <span className="px-3 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5 shrink-0">
                  <ShieldCheck className="w-4 h-4" /> Synced with Windchill
                </span>
              )}
            </div>

            {/* Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
                <span className="text-slate-400 block font-medium">Product / BOM Component</span>
                <p className="font-bold text-slate-900 dark:text-white">{selectedECR.productName}</p>
                <p className="text-slate-500">Component: {selectedECR.componentCode}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
                <span className="text-slate-400 block font-medium">Priority & Author</span>
                <p className="font-bold text-slate-900 dark:text-white">{selectedECR.priority} Priority</p>
                <p className="text-slate-500">Created By: {selectedECR.createdBy}</p>
              </div>
            </div>

            {/* Description & Proposed Changes */}
            <div className="space-y-3 text-xs">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-1">Issue Description & Justification</h4>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 leading-relaxed">
                  {selectedECR.description}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-1">Proposed Engineering & CAD Changes</h4>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 font-mono whitespace-pre-wrap leading-relaxed">
                  {selectedECR.proposedChanges}
                </div>
              </div>
            </div>

            {/* Windchill REST Payload Box */}
            {selectedECR.windchillEcrNumber && (
              <div className="p-4 rounded-xl bg-slate-900 text-white space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between text-emerald-400">
                  <span className="font-bold">PTC Windchill REST Sync Status</span>
                  <span>{selectedECR.windchillSyncTime}</span>
                </div>
                <p className="text-slate-300">
                  Assigned PTC Windchill ECR ID: <strong className="text-indigo-400">{selectedECR.windchillEcrNumber}</strong>
                </p>
                <p className="text-slate-400 text-[11px]">
                  REST Endpoint: {windchillConfig.baseUrl}{windchillConfig.restEndpoint}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="lg:col-span-2 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center text-slate-400 text-xs">
            Select an ECR from the queue to view engineering change specifications and push to PTC Windchill.
          </div>
        )}
      </div>
    </div>
  );
};
