import React from 'react';
import {
  Sparkles,
  RefreshCw,
  Building2,
  FilePlus2,
  LogIn,
  LogOut,
  User,
  ShieldCheck
} from 'lucide-react';
import { Language, translations } from '../i18n';
import { User as FirebaseUser } from 'firebase/auth';

interface Props {
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
  onOpenReportModal: () => void;
  onResetDemo: () => void;
  isResetting: boolean;
  activeTab: string;
  currentUser: FirebaseUser | null;
  onSignIn: () => void;
  onSignOut: () => void;
}

export const Navbar: React.FC<Props> = ({
  currentLang,
  onLanguageChange,
  onOpenReportModal,
  onResetDemo,
  isResetting,
  currentUser,
  onSignIn,
  onSignOut,
}) => {
  const t = translations[currentLang];

  return (
    <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-indigo-900/40 px-4 lg:px-6 py-3">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25">
            <Building2 className="w-5 h-5" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-white tracking-tight flex items-center gap-1.5">
                {t.appTitle}
                <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Chennai GCC
                </span>
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              {t.appSubtitle}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* AI Status Indicator */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span>Gemini Intelligence</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          </div>

          {/* Demo Reset Button */}
          <button
            onClick={onResetDemo}
            disabled={isResetting}
            title="Reset to 14 realistic Chennai waterlogging complaints"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
            <span>{t.resetDemo}</span>
          </button>

          {/* Language Toggle */}
          <div className="flex items-center bg-slate-800/90 rounded-lg p-0.5 border border-slate-700 text-xs font-semibold">
            <button
              onClick={() => onLanguageChange('en')}
              className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                currentLang === 'en'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => onLanguageChange('ta')}
              className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                currentLang === 'ta'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              தமிழ்
            </button>
          </div>

          {/* Firebase Authentication (Google Sign-In) */}
          {currentUser ? (
            <div className="flex items-center gap-2 bg-slate-800/90 border border-slate-700 rounded-xl px-2.5 py-1 text-xs">
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || 'User'}
                  className="w-6 h-6 rounded-full border border-indigo-400"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white text-[10px]">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
              <span className="hidden md:inline font-medium text-slate-200 max-w-[100px] truncate">
                {currentUser.displayName || currentUser.email}
              </span>
              <button
                onClick={onSignOut}
                className="text-slate-400 hover:text-rose-400 p-1 transition cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onSignIn}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-medium transition cursor-pointer shadow-sm"
              title="Secure Municipal Identification via Google"
            >
              <LogIn className="w-3.5 h-3.5 text-indigo-400" />
              <span>Google Sign-in</span>
            </button>
          )}

          {/* Report Complaint CTA */}
          <button
            onClick={onOpenReportModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium text-xs sm:text-sm shadow-md shadow-indigo-600/30 transition cursor-pointer"
          >
            <FilePlus2 className="w-4 h-4" />
            <span>{t.fileComplaint}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
