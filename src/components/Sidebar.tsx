import React from 'react';
import {
  LayoutDashboard,
  Layers,
  MapPin,
  FileText,
  ShieldAlert,
  Wrench,
  BarChart3,
  Bot,
  Settings,
  Building2,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  UserCheck,
  User,
  LogOut,
  LogIn,
  X
} from 'lucide-react';
import { Language, translations } from '../i18n';
import { User as FirebaseUser } from 'firebase/auth';

export type NavTab =
  | 'overview'
  | 'complaints'
  | 'recurrence'
  | 'map'
  | 'inspections'
  | 'analytics'
  | 'chatbot'
  | 'settings';

interface Props {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  currentLang: Language;
  postRepairRelapseCount: number;
  onResetDemo: () => void;
  isResetting: boolean;
  currentUser: FirebaseUser | null;
  onSignIn: () => void;
  onSignOut: () => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<Props> = ({
  activeTab,
  onSelectTab,
  currentLang,
  postRepairRelapseCount,
  onResetDemo,
  isResetting,
  currentUser,
  onSignIn,
  onSignOut,
  mobileOpen = false,
  onCloseMobile,
}) => {
  const t = translations[currentLang];

  const navItems = [
    {
      id: 'overview' as NavTab,
      label: t.overview,
      icon: LayoutDashboard,
    },
    {
      id: 'complaints' as NavTab,
      label: t.complaints,
      icon: FileText,
    },
    {
      id: 'recurrence' as NavTab,
      label: t.recurrence,
      icon: Layers,
      highlight: true,
      badge: postRepairRelapseCount > 0 ? `${postRepairRelapseCount} Alarms` : undefined,
      badgeColor: 'bg-rose-50 text-rose-700 border border-rose-200 font-bold',
    },
    {
      id: 'map' as NavTab,
      label: t.hotspotMap,
      icon: MapPin,
    },
    {
      id: 'inspections' as NavTab,
      label: t.inspections,
      icon: Wrench,
    },
    {
      id: 'analytics' as NavTab,
      label: t.analytics,
      icon: BarChart3,
    },
    {
      id: 'chatbot' as NavTab,
      label: t.chatbot,
      icon: Bot,
    },
    {
      id: 'settings' as NavTab,
      label: t.settings,
      icon: Settings,
    },
  ];

  return (
    <aside
      className={`fixed md:sticky top-0 z-40 h-screen w-64 bg-white border-r border-gray-200 flex flex-col justify-between shrink-0 shadow-2xs select-none transition-transform duration-200 ease-in-out ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}
    >
      {/* Top: Logo & Nav items */}
      <div className="p-4 space-y-5 overflow-y-auto">
        {/* Brand */}
        <div className="flex items-center justify-between px-1.5 py-1">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20 shrink-0 font-bold">
              <Building2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-gray-900 text-sm tracking-tight truncate">
                  CivicLoop AI
                </span>
                <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-1.5 py-0.2 rounded border border-indigo-200 uppercase">
                  GCC
                </span>
              </div>
              <p className="text-[10px] text-gray-500 font-medium truncate">
                Recurrence Intelligence
              </p>
            </div>
          </div>

          {/* Close button for mobile */}
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="md:hidden p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Navigation links */}
        <nav className="space-y-1">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 pb-1">
            Core Modules
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition cursor-pointer group ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-2xs'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition ${
                      isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-600'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap ml-2 ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom: Municipal Workspace & User Profile */}
      <div className="p-3.5 border-t border-gray-200 space-y-2.5 bg-gray-50/50">
        {/* Workspace Card */}
        <div className="bg-white p-2.5 rounded-lg border border-gray-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-semibold text-gray-900">Command Basin</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" title="System Live" />
          </div>
          <p className="text-[10px] text-gray-500 font-medium truncate">
            Greater Chennai Corporation • ISWD-2026
          </p>
        </div>

        {/* User Account / Role */}
        <div className="bg-white p-2.5 rounded-lg border border-gray-200 shadow-2xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {currentUser?.photoURL ? (
              <img
                src={currentUser.photoURL}
                alt={currentUser.displayName || 'Officer'}
                className="w-7 h-7 rounded-full border border-indigo-200 object-cover shrink-0"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                KR
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs font-bold text-gray-900 truncate">
                {currentUser?.displayName || 'Er. K. Ramanathan'}
              </p>
              <p className="text-[10px] text-gray-500 truncate">
                Superintending Engineer
              </p>
            </div>
          </div>

          {currentUser ? (
            <button
              onClick={onSignOut}
              className="p-1 rounded text-gray-400 hover:text-rose-600 hover:bg-gray-100 transition cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={onSignIn}
              className="p-1 rounded text-gray-400 hover:text-indigo-600 hover:bg-gray-100 transition cursor-pointer"
              title="Sign In with Google"
            >
              <LogIn className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Reset Demo Button */}
        <button
          onClick={onResetDemo}
          disabled={isResetting}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900 text-[11px] font-medium shadow-2xs transition cursor-pointer disabled:opacity-50"
          title="Restore baseline 16 Chennai complaints and 10 clusters"
        >
          <RefreshCw className={`w-3 h-3 ${isResetting ? 'animate-spin' : ''}`} />
          <span>{t.resetDemo}</span>
        </button>
      </div>
    </aside>
  );
};
