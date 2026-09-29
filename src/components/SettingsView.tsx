import React from 'react';
import { Settings, Shield, UserCheck, Key, Lock, CheckCircle2, Clock, Terminal, Laptop, Box, Download } from 'lucide-react';
import { AuditLog, UserRole } from '../types';

interface SettingsViewProps {
  auditLogs: AuditLog[];
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ auditLogs, userRole, setUserRole }) => {
  const rbacMatrix = [
    { role: 'Admin', ingest: true, viewAI: true, createECR: true, syncWindchill: true, audit: true },
    { role: 'Manager', ingest: true, viewAI: true, createECR: true, syncWindchill: true, audit: true },
    { role: 'Engineer', ingest: true, viewAI: true, createECR: true, syncWindchill: true, audit: false },
    { role: 'Customer', ingest: true, viewAI: false, createECR: false, syncWindchill: false, audit: false },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-500" />
          Role-Based Access Control (RBAC) & Audit Logging
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Manage system permissions across enterprise user roles and inspect security audit trails.
        </p>
      </div>

      {/* RBAC Matrix Card */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-[#18181b] shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Shield className="w-4 h-4 text-indigo-400" />
          Enterprise Permission Matrix
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-[#111114] text-slate-500 dark:text-slate-400 font-semibold">
              <tr>
                <th className="py-2.5 px-3">Role Name</th>
                <th className="py-2.5 px-3">Submit Feedback</th>
                <th className="py-2.5 px-3">View AI NLP Analytics</th>
                <th className="py-2.5 px-3">Create ECRs</th>
                <th className="py-2.5 px-3">Sync Windchill REST</th>
                <th className="py-2.5 px-3">Audit Logs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {rbacMatrix.map((r) => (
                <tr key={r.role} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="py-3 px-3 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-indigo-500" />
                    {r.role}
                  </td>
                  <td className="py-3 px-3">{r.ingest ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Lock className="w-4 h-4 text-slate-300" />}</td>
                  <td className="py-3 px-3">{r.viewAI ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Lock className="w-4 h-4 text-slate-300" />}</td>
                  <td className="py-3 px-3">{r.createECR ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Lock className="w-4 h-4 text-slate-300" />}</td>
                  <td className="py-3 px-3">{r.syncWindchill ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Lock className="w-4 h-4 text-slate-300" />}</td>
                  <td className="py-3 px-3">{r.audit ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Lock className="w-4 h-4 text-slate-300" />}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-[#18181b] shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-400" />
          Live Security Audit Trail
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-[#111114] text-slate-500 dark:text-slate-400 font-semibold">
              <tr>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">User & Role</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3">Target Module</th>
                <th className="py-2.5 px-3">Event Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="py-3 px-3 font-mono text-slate-400 whitespace-nowrap">{log.timestamp}</td>
                  <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">{log.user} ({log.role})</td>
                  <td className="py-3 px-3 text-indigo-600 dark:text-indigo-400 font-bold">{log.action}</td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-300">{log.targetModule}</td>
                  <td className="py-3 px-3 text-slate-500 dark:text-slate-400 max-w-xs">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Localhost & Deployment Card */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-[#18181b] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Laptop className="w-4 h-4 text-indigo-400" />
              Localhost & Deployment Configuration
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Port :3000 Ready
            </span>
          </div>
          <a
            href="/api/download/project.zip"
            download="plm-feedback-intelligence.zip"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-all self-start sm:self-auto cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Download Source Folder (.zip)
          </a>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          This system is completely self-contained and ready to execute locally on your machine on <code className="font-mono text-indigo-400">http://localhost:3000</code> with full Node.js Express backend APIs and Docker support.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#111114] border border-slate-200 dark:border-white/5 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
              <Terminal className="w-4 h-4 text-indigo-500" />
              Option 1: Run Locally via Node.js
            </div>
            <pre className="p-2.5 rounded-lg bg-slate-900 dark:bg-black text-slate-100 font-mono text-[11px] overflow-x-auto">
npm install{'\n'}npm run dev
            </pre>
            <p className="text-[11px] text-slate-500">
              Starts server on port 3000 with hot-reload and backend REST API middleware.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#111114] border border-slate-200 dark:border-white/5 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
              <Box className="w-4 h-4 text-sky-400" />
              Option 2: Run via Docker Compose
            </div>
            <pre className="p-2.5 rounded-lg bg-slate-900 dark:bg-black text-slate-100 font-mono text-[11px] overflow-x-auto">
docker compose up --build
            </pre>
            <p className="text-[11px] text-slate-500">
              One-command containerized execution with port 3000 mapped automatically.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
