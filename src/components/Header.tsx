import React, { useState } from 'react';
import {
  Search,
  Calendar,
  Bell,
  Globe2,
  FilePlus2,
  FileDown,
  LogIn,
  LogOut,
  User,
  ShieldAlert,
  ChevronDown,
  CheckCircle2,
  Activity,
  Sparkles,
  Command,
  Menu
} from 'lucide-react';
import { Language, translations } from '../i18n';
import { User as FirebaseUser } from 'firebase/auth';
import { RecurrenceCluster } from '../types';

interface Props {
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
  activeTabTitle: string;
  onOpenReportModal: () => void;
  onExportBriefing: () => void;
  currentUser: FirebaseUser | null;
  onSignIn: () => void;
  onSignOut: () => void;
  clusters: RecurrenceCluster[];
  onSelectCluster: (cluster: RecurrenceCluster) => void;
  onSearchQueryChange?: (q: string) => void;
  searchQuery?: string;
  onOpenMobile?: () => void;
}

export const Header: React.FC<Props> = ({
  currentLang,
  onLanguageChange,
  activeTabTitle,
  onOpenReportModal,
  onExportBriefing,
  currentUser,
  onSignIn,
  onSignOut,
  clusters,
  onSelectCluster,
  onSearchQueryChange,
  searchQuery = '',
  onOpenMobile,
}) => {
  const t = translations[currentLang];
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');

  // Relapsed clusters count for notification badge
  const relapsedClusters = clusters.filter(
    (c) => c.isPostRepairRecurrence || c.status === 'post_repair_relapse'
  );

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200 px-4 lg:px-8 py-3 shadow-2xs">
      <div className="flex items-center justify-between gap-3">
        {/* Left: Mobile Menu Trigger & Breadcrumbs */}
        <div className="flex items-center gap-3 min-w-0">
          {onOpenMobile && (
            <button
              onClick={onOpenMobile}
              className="md:hidden p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition cursor-pointer"
              title="Open Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div>
            <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
              <span className="hover:text-gray-700 transition cursor-pointer">Civic Operations</span>
              <span>/</span>
              <span className="text-gray-900 font-semibold">{activeTabTitle}</span>
            </div>
            <h1 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight truncate mt-0.5">
              {activeTabTitle}
            </h1>
          </div>
        </div>

        {/* Center: Global Search input */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchQueryChange && onSearchQueryChange(e.target.value)}
              placeholder="Search hotspots, wards, streets, complaints..."
              className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-12 py-2 text-xs text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
            />
            <div className="absolute right-2.5 top-2.5 flex items-center gap-0.5 text-[10px] text-gray-400 font-mono bg-white border border-gray-200 rounded px-1.5 py-0.5 pointer-events-none">
              <span>⌘K</span>
            </div>
          </div>
        </div>

        {/* Right: Actions, Filters, Notifications, Auth */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Time range selector */}
          <div className="hidden lg:flex items-center bg-gray-50 border border-gray-200 rounded-lg p-0.5 text-xs font-medium text-gray-600">
            <button
              onClick={() => setSelectedTimeRange('30d')}
              className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                selectedTimeRange === '30d' ? 'bg-white text-gray-900 font-semibold shadow-2xs' : 'hover:text-gray-900'
              }`}
            >
              30 Days
            </button>
            <button
              onClick={() => setSelectedTimeRange('monsoon')}
              className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                selectedTimeRange === 'monsoon' ? 'bg-white text-gray-900 font-semibold shadow-2xs' : 'hover:text-gray-900'
              }`}
            >
              Monsoon
            </button>
            <button
              onClick={() => setSelectedTimeRange('all')}
              className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                selectedTimeRange === 'all' ? 'bg-white text-gray-900 font-semibold shadow-2xs' : 'hover:text-gray-900'
              }`}
            >
              All Time
            </button>
          </div>

          {/* Language Switch */}
          <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg p-0.5 text-xs font-semibold">
            <button
              onClick={() => onLanguageChange('en')}
              className={`px-2 py-1 rounded-md transition cursor-pointer ${
                currentLang === 'en' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => onLanguageChange('ta')}
              className={`px-2 py-1 rounded-md transition cursor-pointer ${
                currentLang === 'ta' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              தமிழ்
            </button>
          </div>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition cursor-pointer"
              title="Operational Alerts"
            >
              <Bell className="w-4 h-4" />
              {relapsedClusters.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center animate-pulse">
                  {relapsedClusters.length}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-xl p-3 space-y-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-rose-600" />
                    Operational Recurrence Alerts
                  </span>
                  <span className="text-[10px] bg-rose-50 text-rose-700 font-bold px-1.5 py-0.5 rounded border border-rose-200">
                    {relapsedClusters.length} relapses
                  </span>
                </div>

                <div className="max-h-64 overflow-y-auto space-y-2 text-xs">
                  {relapsedClusters.length === 0 ? (
                    <p className="text-gray-500 text-center py-4 text-[11px]">No active post-repair breaches.</p>
                  ) : (
                    relapsedClusters.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => {
                          onSelectCluster(c);
                          setShowNotifications(false);
                        }}
                        className="p-2 rounded-lg bg-rose-50/60 hover:bg-rose-50 border border-rose-200/80 cursor-pointer transition space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-rose-900 text-xs truncate max-w-[180px]">{c.area}</span>
                          <span className="text-[10px] text-rose-700 font-bold">{c.priorityScore}/100</span>
                        </div>
                        <p className="text-[11px] text-rose-800 line-clamp-1">
                          Flooded again {c.daysBetweenRepairAndRecurrence || 14} days post-repair.
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Export Briefing Button */}
          <button
            onClick={onExportBriefing}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900 text-xs font-medium shadow-2xs transition cursor-pointer"
            title="Export official citywide briefing PDF for GCC administration"
          >
            <FileDown className="w-3.5 h-3.5 text-indigo-600" />
            <span>Export Briefing</span>
          </button>

          {/* Report Complaint CTA */}
          <button
            onClick={onOpenReportModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs shadow-xs transition cursor-pointer"
          >
            <FilePlus2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.fileComplaint}</span>
            <span className="sm:hidden">Report</span>
          </button>
        </div>
      </div>
    </header>
  );
};
