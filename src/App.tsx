import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { FeedbackHubView } from './components/FeedbackHubView';
import { FeedbackDetailModal } from './components/FeedbackDetailModal';
import { UploadIngestionView } from './components/UploadIngestionView';
import { AIPipelineView } from './components/AIPipelineView';
import { RecommendationECRView } from './components/RecommendationECRView';
import { PLMExplorerView } from './components/PLMExplorerView';
import { WindchillIntegrationView } from './components/WindchillIntegrationView';
import { ReportsView } from './components/ReportsView';
import { ArchitectureDocsView } from './components/ArchitectureDocsView';
import { SettingsView } from './components/SettingsView';

import {
  INITIAL_PRODUCTS,
  INITIAL_BOM,
  INITIAL_FEEDBACK,
  INITIAL_ECRS,
  INITIAL_WINDCHILL_CONFIG,
  INITIAL_AUDIT_LOGS,
} from './data/mockData';

import {
  UserRole,
  FeedbackItem,
  Product,
  ComponentBOM,
  EngineeringChangeRequest,
  WindchillConfig,
  AuditLog,
} from './types';

export default function App() {
  const [userRole, setUserRole] = useState<UserRole>('Admin');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Domain State
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [bomList, setBomList] = useState<ComponentBOM[]>(INITIAL_BOM);
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>(INITIAL_FEEDBACK);
  const [ecrList, setEcrList] = useState<EngineeringChangeRequest[]>(INITIAL_ECRS);
  const [windchillConfig, setWindchillConfig] = useState<WindchillConfig>(INITIAL_WINDCHILL_CONFIG);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);

  // Modal / Action States
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);
  const [isCreatingECR, setIsCreatingECR] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Sync Dark Mode class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Initial Fetch from backend server API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pRes, fRes, eRes, wRes, aRes] = await Promise.all([
          fetch('/api/products').then((r) => r.json()).catch(() => null),
          fetch('/api/feedback').then((r) => r.json()).catch(() => null),
          fetch('/api/ecr').then((r) => r.json()).catch(() => null),
          fetch('/api/windchill/config').then((r) => r.json()).catch(() => null),
          fetch('/api/audit').then((r) => r.json()).catch(() => null),
        ]);

        if (Array.isArray(pRes)) setProducts(pRes);
        if (Array.isArray(fRes)) setFeedbackList(fRes);
        if (Array.isArray(eRes)) setEcrList(eRes);
        if (wRes && wRes.baseUrl) setWindchillConfig(wRes);
        if (Array.isArray(aRes)) setAuditLogs(aRes);
      } catch (err) {
        console.log('Using initial fallback state.');
      }
    };
    fetchData();
  }, []);

  // Action: Create ECR for a feedback item
  const handleCreateECR = async (feedback: FeedbackItem) => {
    setIsCreatingECR(true);
    try {
      const rec = feedback.engineeringRecommendation;
      const res = await fetch('/api/ecr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feedbackId: feedback.id,
          title: rec?.title || feedback.title,
          productId: feedback.productId,
          productName: feedback.productName,
          componentCode: rec?.componentCode || 'COMP-GEN-01',
          plmStage: rec?.targetPLMStage || feedback.plmStage,
          priority: feedback.priority,
          proposedChanges: rec?.suggestedAction || 'Update CAD and BOM specifications in Windchill.',
          createdBy: userRole,
        }),
      });

      const data = await res.json();
      if (data.success && data.ecr) {
        setEcrList((prev) => [data.ecr, ...prev]);

        // Update local feedback item
        setFeedbackList((prev) =>
          prev.map((f) =>
            f.id === feedback.id
              ? {
                  ...f,
                  status: 'ECR Created',
                  ecrReference: {
                    ecrId: data.ecr.id,
                    ecrNumber: data.ecr.ecrNumber,
                    status: data.ecr.status,
                  },
                }
              : f
          )
        );

        if (selectedFeedback && selectedFeedback.id === feedback.id) {
          setSelectedFeedback({
            ...selectedFeedback,
            status: 'ECR Created',
            ecrReference: {
              ecrId: data.ecr.id,
              ecrNumber: data.ecr.ecrNumber,
              status: data.ecr.status,
            },
          });
        }
      }
    } catch (err) {
      console.error('Failed to create ECR:', err);
    } finally {
      setIsCreatingECR(false);
    }
  };

  // Action: Windchill REST Sync
  const handleTriggerWindchillSync = async (ecrId?: string) => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/windchill/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: ecrId ? 'sync_ecr' : 'full_sync',
          ecrId,
        }),
      });

      const data = await res.json();
      if (data.success) {
        if (data.config) setWindchillConfig(data.config);
        if (data.ecr) {
          setEcrList((prev) => prev.map((e) => (e.id === data.ecr.id ? data.ecr : e)));
        }
      }
    } catch (err) {
      console.error('Windchill sync error:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleAnalysisSuccess = (newItem: FeedbackItem) => {
    setFeedbackList((prev) => [newItem, ...prev]);
    setSelectedFeedback(newItem);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors selection:bg-indigo-500/30">
      {/* Top Navigation */}
      <Navbar
        userRole={userRole}
        setUserRole={setUserRole}
        windchillConfig={windchillConfig}
        onRefreshSync={() => handleTriggerWindchillSync()}
        isSyncing={isSyncing}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      {/* App Body Container */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          feedbackCount={feedbackList.length}
          ecrCount={ecrList.length}
        />

        {/* Main Workspace View */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              feedbackList={feedbackList}
              ecrList={ecrList}
              onSelectFeedback={(f) => setSelectedFeedback(f)}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'feedback' && (
            <FeedbackHubView
              feedbackList={feedbackList}
              onSelectFeedback={(f) => setSelectedFeedback(f)}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'upload' && (
            <UploadIngestionView
              products={products}
              onAnalysisSuccess={handleAnalysisSuccess}
              onBatchSuccess={(items) => setFeedbackList((prev) => [...items, ...prev])}
            />
          )}

          {activeTab === 'ai-pipeline' && <AIPipelineView />}

          {activeTab === 'ecr' && (
            <RecommendationECRView
              ecrList={ecrList}
              windchillConfig={windchillConfig}
              onSyncECR={(id) => handleTriggerWindchillSync(id)}
              isSyncing={isSyncing}
            />
          )}

          {activeTab === 'plm' && <PLMExplorerView products={products} bomList={bomList} />}

          {activeTab === 'windchill' && (
            <WindchillIntegrationView
              config={windchillConfig}
              onTriggerSync={() => handleTriggerWindchillSync()}
              isSyncing={isSyncing}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView feedbackList={feedbackList} ecrList={ecrList} />
          )}

          {activeTab === 'architecture' && <ArchitectureDocsView />}

          {activeTab === 'settings' && (
            <SettingsView auditLogs={auditLogs} userRole={userRole} setUserRole={setUserRole} />
          )}
        </main>
      </div>

      {/* Selected Feedback Detail Drawer Modal */}
      <FeedbackDetailModal
        item={selectedFeedback}
        onClose={() => setSelectedFeedback(null)}
        onCreateECR={handleCreateECR}
        isCreatingECR={isCreatingECR}
      />
    </div>
  );
}
