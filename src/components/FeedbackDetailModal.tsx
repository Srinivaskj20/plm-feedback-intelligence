import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Layers,
  CheckCircle,
  AlertOctagon,
  User,
  Calendar,
  Send,
  Cpu,
  Workflow,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { FeedbackItem, PLMStage, PriorityLevel } from '../types';

interface FeedbackDetailModalProps {
  item: FeedbackItem | null;
  onClose: () => void;
  onCreateECR: (feedback: FeedbackItem) => void;
  isCreatingECR: boolean;
}

export const FeedbackDetailModal: React.FC<FeedbackDetailModalProps> = ({
  item,
  onClose,
  onCreateECR,
  isCreatingECR,
}) => {
  if (!item) return null;

  const rec = item.engineeringRecommendation;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-white/10 rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 dark:border-white/5 flex items-start justify-between gap-4 bg-slate-50/50 dark:bg-[#111114]">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span
                className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider ${
                  item.priority === 'Critical'
                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400'
                }`}
              >
                {item.priority} Priority
              </span>
              <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50">
                PLM Stage: {item.plmStage}
              </span>
              <span className="text-xs text-slate-400">ID: {item.id}</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
              {item.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Customer Feedback Body Quote */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pb-2 border-b border-slate-200/50 dark:border-slate-700/50">
              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-indigo-500" />
                <span className="font-semibold text-slate-800 dark:text-slate-200">{item.customerName}</span>
                <span>({item.customerEmail})</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>{item.dateSubmitted}</span>
              </div>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans italic">
              "{item.content}"
            </p>
          </div>

          {/* AI NLP Analytics Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Sentiment & Emotion Card */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                Sentiment & Emotion Diagnostic
              </h4>

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400">Sentiment Score:</span>
                <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                  {item.sentimentScore > 0 ? `+${item.sentimentScore}` : item.sentimentScore} ({item.sentimentLabel})
                </span>
              </div>

              {/* Emotion Meters */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex justify-between text-[10px] text-slate-500 mb-0.5">
                    <span>Frustration</span>
                    <span>{item.emotionBreakdown.frustration}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
                    <div
                      className="bg-rose-500 h-1.5 rounded-full"
                      style={{ width: `${item.emotionBreakdown.frustration}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[10px] text-slate-500 mb-0.5">
                    <span>Disappointment</span>
                    <span>{item.emotionBreakdown.disappointment}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
                    <div
                      className="bg-amber-500 h-1.5 rounded-full"
                      style={{ width: `${item.emotionBreakdown.disappointment}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[10px] text-slate-500 mb-0.5">
                    <span>Satisfaction</span>
                    <span>{item.emotionBreakdown.satisfaction}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
                    <div
                      className="bg-emerald-500 h-1.5 rounded-full"
                      style={{ width: `${item.emotionBreakdown.satisfaction}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Affected Product & Component BOM Card */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-500" />
                Product & BOM Assembly Mapping
              </h4>

              <div className="space-y-1.5 text-xs">
                <div>
                  <span className="text-slate-400">Product: </span>
                  <span className="font-bold text-slate-900 dark:text-white">{item.productName}</span>
                </div>
                <div>
                  <span className="text-slate-400">Affected Component: </span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">
                    {rec?.affectedComponent || 'Rotor Assembly / Sensor Array'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Component Code: </span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">
                    {rec?.componentCode || 'COMP-GEN-01'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Target Lifecycle Stage: </span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {rec?.targetPLMStage || item.plmStage}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* AI Engineering Recommendation Box */}
          {rec && (
            <div className="p-4 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/20 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  Gemini AI Engineering Recommendation
                </h4>
                <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-bold">
                  Effort: {rec.estimatedEffort}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <p className="font-bold text-slate-900 dark:text-white">{rec.title}</p>
                <p className="text-slate-600 dark:text-slate-300">{rec.summary}</p>
                <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900/40 text-[11px]">
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">Suggested ECO Action: </span>
                  <span className="text-slate-700 dark:text-slate-300">{rec.suggestedAction}</span>
                </div>
              </div>
            </div>
          )}

          {/* ECR Reference Status if exists */}
          {item.ecrReference && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div>
                  <span className="font-bold text-emerald-950 dark:text-emerald-200">
                    ECR Generated: {item.ecrReference.ecrNumber}
                  </span>
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block">
                    Status: {item.ecrReference.status}
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                Synced with Windchill
              </span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
          >
            Close
          </button>

          {!item.ecrReference ? (
            <button
              onClick={() => onCreateECR(item)}
              disabled={isCreatingECR}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/30 flex items-center gap-2"
            >
              <Workflow className="w-4 h-4" />
              <span>{isCreatingECR ? 'Generating Windchill ECR...' : 'Create & Sync Windchill ECR'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" /> ECR Active in PTC Windchill
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
