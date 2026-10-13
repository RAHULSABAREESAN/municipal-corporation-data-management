/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { RecurrenceCluster, Complaint, SystemStats } from './types';
import { Language, translations } from './i18n';
import { Sidebar, NavTab } from './components/Sidebar';
import { Header } from './components/Header';
import { OverviewView } from './components/OverviewView';
import { ComplaintsManagementView } from './components/ComplaintsManagementView';
import { RecurrenceIntelligenceView } from './components/RecurrenceIntelligenceView';
import { HotspotMapView } from './components/HotspotMapView';
import { InspectionsVerificationView } from './components/InspectionsVerificationView';
import { AnalyticsReportsView } from './components/AnalyticsReportsView';
import { CivicChatbotView } from './components/CivicChatbotView';
import { SettingsView } from './components/SettingsView';
import { ClusterDetailModal } from './components/ClusterDetailModal';
import { ComplaintFormModal } from './components/ComplaintFormModal';
import { exportDashboardStatsPDF } from './utils/pdfExport';
import { INITIAL_CLUSTERS, INITIAL_COMPLAINTS } from './data/mockData';
import {
  auth,
  signInWithGoogle,
  logoutUser,
  seedInitialFirestoreData,
  saveClusterToFirestore,
} from './firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('overview');
  const [currentLang, setCurrentLang] = useState<Language>('en');

  const [clusters, setClusters] = useState<RecurrenceCluster[]>(INITIAL_CLUSTERS);
  const [complaints, setComplaints] = useState<Complaint[]>(INITIAL_COMPLAINTS);
  const [stats, setStats] = useState<SystemStats | null>(null);

  const [selectedCluster, setSelectedCluster] = useState<RecurrenceCluster | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Firebase Auth user
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);

  // Listen for Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Fetch all state from server & seed Firestore
  const fetchData = async () => {
    try {
      const [resStats, resClusters, resComplaints] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/clusters'),
        fetch('/api/complaints'),
      ]);

      if (resStats.ok) {
        const statsData = await resStats.json();
        setStats(statsData);
      }
      if (resClusters.ok) {
        const clustersData = await resClusters.json();
        setClusters(clustersData);
      }
      if (resComplaints.ok) {
        const complaintsData = await resComplaints.json();
        setComplaints(complaintsData);
      }

      // Seed initial data to Firestore
      seedInitialFirestoreData(INITIAL_COMPLAINTS, INITIAL_CLUSTERS);
    } catch (err) {
      console.warn('Backend fetch error, using local mock state:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleResetDemo = async () => {
    setIsResetting(true);
    try {
      const res = await fetch('/api/reset-demo', { method: 'POST' });
      if (res.ok) {
        await fetchData();
      }
    } catch (err) {
      console.error('Reset error:', err);
    } finally {
      setIsResetting(false);
    }
  };

  const handleClusterUpdated = (updatedCluster: RecurrenceCluster) => {
    setSelectedCluster(updatedCluster);
    setClusters((prev) =>
      prev.map((c) => (c.id === updatedCluster.id ? updatedCluster : c))
    );
    saveClusterToFirestore(updatedCluster);
    fetchData();
  };

  const postRepairRelapseCount = clusters.filter(
    (cl) => cl.isPostRepairRecurrence || cl.status === 'post_repair_relapse'
  ).length;

  const t = translations[currentLang];

  const getTabTitle = () => {
    switch (activeTab) {
      case 'overview':
        return t.overview;
      case 'complaints':
        return t.complaints;
      case 'recurrence':
        return t.recurrence;
      case 'map':
        return t.hotspotMap;
      case 'inspections':
        return t.inspections;
      case 'analytics':
        return t.analytics;
      case 'chatbot':
        return t.chatbot;
      case 'settings':
        return t.settings;
      default:
        return 'Civic Operations';
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F8FC] text-[#101828] flex font-sans">
      {/* Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        currentLang={currentLang}
        postRepairRelapseCount={postRepairRelapseCount}
        onResetDemo={handleResetDemo}
        isResetting={isResetting}
        currentUser={currentUser}
        onSignIn={signInWithGoogle}
        onSignOut={logoutUser}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Backdrop for mobile sidebar */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-2xs md:hidden"
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Header */}
        <Header
          currentLang={currentLang}
          onLanguageChange={setCurrentLang}
          activeTabTitle={getTabTitle()}
          onOpenReportModal={() => setIsReportModalOpen(true)}
          onExportBriefing={() => exportDashboardStatsPDF(stats, clusters)}
          currentUser={currentUser}
          onSignIn={signInWithGoogle}
          onSignOut={logoutUser}
          clusters={clusters}
          onSelectCluster={setSelectedCluster}
          onSearchQueryChange={setSearchQuery}
          searchQuery={searchQuery}
          onOpenMobile={() => setMobileSidebarOpen(true)}
        />

        {/* Dynamic View Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {activeTab === 'overview' && (
            <OverviewView
              stats={stats}
              clusters={clusters}
              complaints={complaints}
              onSelectCluster={setSelectedCluster}
              onNavigateToTab={setActiveTab}
              onOpenReportModal={() => setIsReportModalOpen(true)}
              currentLang={currentLang}
            />
          )}

          {activeTab === 'complaints' && (
            <ComplaintsManagementView
              complaints={complaints}
              clusters={clusters}
              onSelectCluster={setSelectedCluster}
              onOpenReportModal={() => setIsReportModalOpen(true)}
              currentLang={currentLang}
            />
          )}

          {activeTab === 'recurrence' && (
            <RecurrenceIntelligenceView
              clusters={clusters}
              onSelectCluster={setSelectedCluster}
              currentLang={currentLang}
            />
          )}

          {activeTab === 'map' && (
            <HotspotMapView
              clusters={clusters}
              complaints={complaints}
              onSelectCluster={setSelectedCluster}
              currentLang={currentLang}
            />
          )}

          {activeTab === 'inspections' && (
            <InspectionsVerificationView
              clusters={clusters}
              onRefreshClusters={fetchData}
              onSelectCluster={setSelectedCluster}
              currentLang={currentLang}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsReportsView
              stats={stats}
              clusters={clusters}
              complaints={complaints}
              onSelectCluster={setSelectedCluster}
              currentLang={currentLang}
            />
          )}

          {activeTab === 'chatbot' && (
            <CivicChatbotView currentLang={currentLang} />
          )}

          {activeTab === 'settings' && (
            <SettingsView currentLang={currentLang} />
          )}
        </main>
      </div>

      {/* Incident Detail Modal */}
      {selectedCluster && (
        <ClusterDetailModal
          cluster={selectedCluster}
          onClose={() => setSelectedCluster(null)}
          onClusterUpdated={handleClusterUpdated}
          currentLang={currentLang}
        />
      )}

      {/* Citizen Complaint Intake Modal */}
      <ComplaintFormModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmitSuccess={() => {
          fetchData();
          setActiveTab('complaints');
        }}
        currentLang={currentLang}
      />
    </div>
  );
}
