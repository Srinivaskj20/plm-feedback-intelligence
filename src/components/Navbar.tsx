import React, { useState } from 'react';
import {
  Cpu,
  Search,
  Bell,
  CheckCircle2,
  RefreshCw,
  UserCheck,
  ShieldAlert,
  Moon,
  Sun,
  Layers,
  Sparkles,
  Laptop,
  Download,
} from 'lucide-react';
import { UserRole, WindchillConfig } from '../types';
import { LocalhostGuideModal } from './LocalhostGuideModal';

interface NavbarProps {
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  windchillConfig: WindchillConfig;
  onRefreshSync: () => void;
  isSyncing: boolean;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  userRole,
  setUserRole,
  windchillConfig,
  onRefreshSync,
  isSyncing,
  searchQuery,
  setSearchQuery,
  setActiveTab,
  darkMode,
  setDarkMode,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLocalhostModal, setShowLocalhostModal] = useState(false);

  const notifications = [
    { id: 1, title: 'Micro-cracking on Rotor Blade', time: '10m ago', type: 'Critical' },
    { id: 2, title: 'Windchill ECR-2026-9011 Synced', time: '1h ago', type: 'Success' },
    { id: 3, title: 'AI Analysis Completed: 15 items', time: '3h ago', type: 'Info' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-white/5 bg-white/95 dark:bg-[#09090b]/80 backdrop-blur-md px-4 py-3 transition-colors">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-indigo-600 text-white shadow-md shadow-indigo-600/20">
            <Cpu className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                PLM Feedback AI
              </h1>
              <span className="text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-500/20">
                Enterprise v3.2
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
              Product Lifecycle Intelligence & PTC Windchill Connector
            </p>
          </div>
        </div>

        {/* Center: Search & Quick Actions */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search feedback, ECRs, BOM components, topics..."
              className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#111114] text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Right: Controls, Role Switcher, Windchill Status, Theme */}
        <div className="flex items-center gap-3">
          {/* Windchill Status Pill */}
          <button
            onClick={onRefreshSync}
            disabled={isSyncing}
            className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700/80 transition-all text-slate-700 dark:text-slate-300"
            title="Click to trigger Windchill REST Sync"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <Layers className="w-3.5 h-3.5 text-indigo-500" />
            <span>Windchill: {windchillConfig.status}</span>
            <RefreshCw className={`w-3 h-3 text-slate-400 ${isSyncing ? 'animate-spin' : ''}`} />
          </button>

          {/* Download Source Code Folder (.zip) */}
          <a
            href="/api/download/project.zip"
            download="plm-feedback-intelligence.zip"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 transition-all shadow-xs"
            title="Download complete project source files as a .zip folder"
          >
            <Download className="w-3.5 h-3.5 text-emerald-500" />
            <span className="hidden sm:inline">Download Code (.zip)</span>
          </a>

          {/* Run on Localhost Button */}
          <button
            onClick={() => setShowLocalhostModal(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 transition-all shadow-xs"
            title="View step-by-step instructions & commands to run on localhost:3000"
          >
            <Laptop className="w-3.5 h-3.5 text-indigo-500" />
            <span className="hidden sm:inline">Run Localhost</span>
          </button>

          {/* User Role Selector */}
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
            <UserCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="text-slate-500 dark:text-slate-400 hidden sm:inline">Role:</span>
            <select
              value={userRole}
              onChange={(e) => setUserRole(e.target.value as UserRole)}
              className="bg-transparent text-slate-900 dark:text-white font-semibold focus:outline-none cursor-pointer text-xs"
            >
              <option value="Admin">Admin</option>
              <option value="Manager">Manager</option>
              <option value="Engineer">Engineer</option>
              <option value="Customer">Customer</option>
            </select>
          </div>

          {/* Notifications Drawer Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/80"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900"></span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 p-3">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                    Live System Alerts
                  </h3>
                  <span className="text-[10px] text-slate-400">3 New</span>
                </div>
                <div className="space-y-2">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800/80 text-xs flex items-start gap-2"
                    >
                      {n.type === 'Critical' ? (
                        <ShieldAlert className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                      )}
                      <div>
                        <p className="font-medium text-slate-800 dark:text-slate-200 leading-snug">
                          {n.title}
                        </p>
                        <span className="text-[10px] text-slate-400">{n.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Dark / Light Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/80"
            title="Toggle theme"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>
        </div>
      </div>

      {/* Localhost Setup Guide Modal */}
      <LocalhostGuideModal
        isOpen={showLocalhostModal}
        onClose={() => setShowLocalhostModal(false)}
      />
    </header>
  );
};
