import React, { useState } from 'react';
import {
  Workflow,
  CheckCircle2,
  RefreshCw,
  Layers,
  Database,
  Globe,
  Lock,
  Terminal,
  ShieldCheck,
  Send,
} from 'lucide-react';
import { WindchillConfig } from '../types';

interface WindchillIntegrationViewProps {
  config: WindchillConfig;
  onTriggerSync: () => void;
  isSyncing: boolean;
}

export const WindchillIntegrationView: React.FC<WindchillIntegrationViewProps> = ({
  config,
  onTriggerSync,
  isSyncing,
}) => {
  const [activeTab, setActiveTab] = useState<'config' | 'logs' | 'payload'>('config');

  const samplePayload = {
    "@type": "com.ptc.windchill.ChangeRequest",
    "Name": "ECR-2026-9011 Turbine Rotor Blade Thermal Coating Update",
    "Description": "Micro-cracking under thermal stress test cycles.",
    "Priority": "CRITICAL",
    "LifeCycleState": "IN_WORK",
    "AffectedItems": [
      {
        "Number": "TURB-BLD-09",
        "Revision": "C.2",
        "Type": "wt.part.WTPart"
      }
    ],
    "EngineeringAction": "Modify investment casting core pins and apply YSZ TBC coating."
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Workflow className="w-5 h-5 text-indigo-500" />
            PTC Windchill PLM REST Integration
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Bi-directional REST connector synchronizing Customer Feedback AI change requests with PTC Windchill Change Management.
          </p>
        </div>

        <button
          onClick={onTriggerSync}
          disabled={isSyncing}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 flex items-center gap-2 shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Testing Connection...' : 'Test Connection & Trigger Sync'}</span>
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-white/5 bg-white dark:bg-[#18181b] shadow-sm">
          <span className="text-xs text-slate-400 block mb-1">Connector Status</span>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-base font-bold text-slate-900 dark:text-white">{config.status}</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Last Sync: {config.lastSyncTime}</p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-white/5 bg-white dark:bg-[#18181b] shadow-sm">
          <span className="text-xs text-slate-400 block mb-1">Environment</span>
          <div className="text-base font-bold text-indigo-600 dark:text-indigo-400">{config.environment}</div>
          <p className="text-[10px] text-slate-400 mt-1">REST API v1 Change Management</p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-white/5 bg-white dark:bg-[#18181b] shadow-sm">
          <span className="text-xs text-slate-400 block mb-1">Synced ECRs</span>
          <div className="text-base font-bold text-slate-900 dark:text-white">{config.syncedECRsCount} Records</div>
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">100% Delivery Rate</p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-white/5 bg-white dark:bg-[#18181b] shadow-sm">
          <span className="text-xs text-slate-400 block mb-1">Authentication Method</span>
          <div className="text-base font-bold text-slate-900 dark:text-white">{config.authMethod}</div>
          <p className="text-[10px] text-slate-400 mt-1">Bearer Token Active</p>
        </div>
      </div>

      {/* Main Settings & Payload Inspector */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-[#18181b] shadow-sm space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab('config')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'config'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Connection Endpoints
          </button>
          <button
            onClick={() => setActiveTab('payload')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'payload'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            REST ECR Schema Payload
          </button>
        </div>

        {activeTab === 'config' ? (
          <div className="space-y-4 max-w-2xl text-xs">
            <div>
              <label className="block text-slate-500 font-semibold mb-1">PTC Windchill Base Server URL</label>
              <input
                type="text"
                readOnly
                value={config.baseUrl}
                className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-semibold mb-1">Change Request REST Endpoint</label>
              <input
                type="text"
                readOnly
                value={config.restEndpoint}
                className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-semibold mb-1">Client OAuth Application ID</label>
              <input
                type="text"
                readOnly
                value={config.clientAppId}
                className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-slate-900 dark:text-white"
              />
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-slate-950 text-indigo-300 font-mono text-xs overflow-x-auto border border-slate-800">
            <span className="text-slate-500 block mb-2">// PTC Windchill ChangeManagement/ChangeRequests REST Endpoint Payload</span>
            <pre>{JSON.stringify(samplePayload, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
};
