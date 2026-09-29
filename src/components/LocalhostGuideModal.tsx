import React, { useState } from 'react';
import {
  X,
  Terminal,
  Copy,
  Check,
  Laptop,
  Box,
  ExternalLink,
  ShieldCheck,
  Server,
  Code2,
  Download,
  FolderDown,
} from 'lucide-react';

interface LocalhostGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LocalhostGuideModal: React.FC<LocalhostGuideModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'npm' | 'docker'>('npm');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const npmCommands = [
    { label: '1. Install Dependencies', cmd: 'npm install' },
    { label: '2. Create .env file (Optional)', cmd: 'cp .env.example .env' },
    { label: '3. Start Local Development Server', cmd: 'npm run dev' },
  ];

  const dockerCommands = [
    { label: 'Build and Run Container with Docker Compose', cmd: 'docker compose up --build' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#111114] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Run on Localhost (Your Local Machine)
                <span className="px-2 py-0.5 text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-full">
                  Port :3000
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Execute this full-stack PLM AI application locally in your own terminal
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {/* Overview Banner */}
          <div className="p-3.5 rounded-xl bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-500/20 flex items-start gap-3 text-xs text-indigo-700 dark:text-indigo-300">
            <Server className="w-4 h-4 mt-0.5 shrink-0 text-indigo-500" />
            <div>
              <span className="font-semibold">How Localhost Works:</span> This app contains a unified
              Express + TypeScript backend (<code className="bg-indigo-500/10 px-1 py-0.5 rounded text-indigo-600 dark:text-indigo-300">server.ts</code>)
              and Vite React frontend. When run locally, it will serve on{' '}
              <strong className="underline underline-offset-2">http://localhost:3000</strong> with all
              REST APIs, AI pipelines, and file ingestion enabled!
            </div>
          </div>

          {/* 1-Click Source Code Download Card */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                <FolderDown className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Download Project Source Folder</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded font-mono font-medium bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    .ZIP (~99 KB)
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Includes complete source code, <code className="text-indigo-500 font-mono">server.ts</code>, React UI, Docker configs, and setup documentation.
                </p>
              </div>
            </div>
            <a
              href="/api/download/project.zip"
              download="plm-feedback-intelligence.zip"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs text-white bg-emerald-600 hover:bg-emerald-500 active:scale-95 shadow-md shadow-emerald-600/20 transition-all shrink-0 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Download ZIP
            </a>
          </div>

          {/* Toggle Tabs */}
          <div className="flex gap-2 p-1 bg-slate-100 dark:bg-[#18181b] rounded-xl border border-slate-200 dark:border-white/5">
            <button
              onClick={() => setActiveTab('npm')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'npm'
                  ? 'bg-white dark:bg-[#27272a] text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Terminal className="w-3.5 h-3.5 text-indigo-500" />
              Node.js & NPM (Fastest)
            </button>
            <button
              onClick={() => setActiveTab('docker')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'docker'
                  ? 'bg-white dark:bg-[#27272a] text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Box className="w-3.5 h-3.5 text-sky-500" />
              Docker & Docker Compose
            </button>
          </div>

          {/* Instructions Content */}
          {activeTab === 'npm' ? (
            <div className="space-y-4">
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Requires Node.js 18+ or 20+ installed. Open terminal in the project directory:
              </p>

              {npmCommands.map((item, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-medium text-slate-700 dark:text-slate-300">{item.label}</span>
                  </div>
                  <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-900 dark:bg-black border border-slate-800 text-slate-100 font-mono text-xs">
                    <span>$ {item.cmd}</span>
                    <button
                      onClick={() => copyToClipboard(item.cmd, idx)}
                      className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                      title="Copy command"
                    >
                      {copiedIndex === idx ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-[10px] text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span className="text-[10px]">Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 text-xs text-slate-600 dark:text-slate-400 space-y-1.5">
                <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  How to Access in Browser:
                </div>
                <p>
                  Once started, open your browser and go to{' '}
                  <span className="font-mono text-indigo-500 font-bold bg-indigo-500/10 px-1 py-0.5 rounded">http://localhost:3000</span> or{' '}
                  <span className="font-mono text-indigo-500 font-bold bg-indigo-500/10 px-1 py-0.5 rounded">http://127.0.0.1:3000</span>.
                </p>
                <div className="mt-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-[11px] leading-relaxed">
                  ⚠️ <strong>Notice:</strong> Modern browsers (Chrome, Edge, Safari) block <code className="font-mono">http://0.0.0.0:3000</code> with <code className="font-mono">ERR_ADDRESS_INVALID</code>. Always type <strong>http://localhost:3000</strong> into your address bar.
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Run effortlessly with zero local dependencies using Docker Desktop:
              </p>

              {dockerCommands.map((item, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-medium text-slate-700 dark:text-slate-300">{item.label}</span>
                  </div>
                  <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-900 dark:bg-black border border-slate-800 text-slate-100 font-mono text-xs">
                    <span>$ {item.cmd}</span>
                    <button
                      onClick={() => copyToClipboard(item.cmd, 100 + idx)}
                      className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                      title="Copy command"
                    >
                      {copiedIndex === 100 + idx ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-[10px] text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span className="text-[10px]">Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 text-xs text-slate-600 dark:text-slate-400 space-y-1">
                <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Box className="w-3.5 h-3.5 text-sky-400" />
                  Container Features:
                </div>
                <p>
                  Includes <code className="font-mono text-sky-400">Dockerfile</code> and{' '}
                  <code className="font-mono text-sky-400">docker-compose.yml</code> configured with volume
                  mounts, automated build, and port 3000 mapping.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]">
          <div className="text-xs text-slate-500">
            Read <code className="text-indigo-500 font-mono">README.md</code> for advanced configuration
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shadow-sm"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
