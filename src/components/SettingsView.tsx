import React, { useState } from 'react';
import { CHENNAI_ZONES } from '../data/mockData';
import { Language, translations } from '../i18n';
import {
  Settings,
  Shield,
  Layers,
  Sparkles,
  MapPin,
  CheckCircle2,
  Clock,
  Server,
  Database,
  Key,
  RefreshCw,
  Sliders,
  Globe,
  Building2
} from 'lucide-react';

interface Props {
  currentLang: Language;
}

export const SettingsView: React.FC<Props> = ({ currentLang }) => {
  const t = translations[currentLang];
  const [recurrenceRadius, setRecurrenceRadius] = useState(450);
  const [relapseWindowDays, setRelapseWindowDays] = useState(90);
  const [criticalSlaHours, setCriticalSlaHours] = useState(24);
  const [highSlaHours, setHighSlaHours] = useState(48);

  const [savedNotice, setSavedNotice] = useState(false);

  const handleSave = () => {
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <Settings className="w-6 h-6 text-indigo-600" />
              <span>Municipal System Settings</span>
            </h1>
            <span className="text-xs bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded border border-indigo-200">
              GCC Administrative Console
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Configure Greater Chennai Corporation recurrence clustering parameters, SLA thresholds, and view cloud services connectivity.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer self-start md:self-auto"
        >
          {savedNotice ? '✓ Configuration Saved' : 'Save Configuration'}
        </button>
      </div>

      {/* Recurrence Clustering Parameters */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
          <Layers className="w-4 h-4 text-indigo-600" />
          <h2 className="text-sm font-bold text-gray-900">
            Automated Recurrence Clustering Parameters
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-gray-700 font-semibold mb-1">
              Geographic Proximity Radius (Meters)
            </label>
            <input
              type="number"
              value={recurrenceRadius}
              onChange={(e) => setRecurrenceRadius(Number(e.target.value))}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
            <span className="text-[10px] text-gray-400 mt-0.5 block">
              Complaints within this distance with matching drainage corridor are grouped together (Default: 450m).
            </span>
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-1">
              Post-Repair Defect Liability Window (Days)
            </label>
            <input
              type="number"
              value={relapseWindowDays}
              onChange={(e) => setRelapseWindowDays(Number(e.target.value))}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
            <span className="text-[10px] text-gray-400 mt-0.5 block">
              New complaints filed within this window trigger the contractor warranty relapse alert (Default: 90 days).
            </span>
          </div>
        </div>
      </div>

      {/* SLA Thresholds */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
          <Clock className="w-4 h-4 text-amber-600" />
          <h2 className="text-sm font-bold text-gray-900">
            Emergency SLA Response Guidelines
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-gray-700 font-semibold mb-1">
              Critical Severity Escalation SLA (Hours)
            </label>
            <input
              type="number"
              value={criticalSlaHours}
              onChange={(e) => setCriticalSlaHours(Number(e.target.value))}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
            />
            <span className="text-[10px] text-gray-400 mt-0.5 block">
              For subways flooded &gt;3 feet, hospital approach routes, or main arterials.
            </span>
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-1">
              High Severity Inundation SLA (Hours)
            </label>
            <input
              type="number"
              value={highSlaHours}
              onChange={(e) => setHighSlaHours(Number(e.target.value))}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
            />
            <span className="text-[10px] text-gray-400 mt-0.5 block">
              For residential bus route roads, chronic stormwater canal choking.
            </span>
          </div>
        </div>
      </div>

      {/* Cloud & Platform Integration Status */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
          <Server className="w-4 h-4 text-teal-600" />
          <h2 className="text-sm font-bold text-gray-900">
            Integration & AI Services Connectivity
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 bg-gray-50 rounded-lg border border-gray-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                Gemini 3.8 Flash
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-[11px] text-gray-500">
              Active for hydrological root-cause hypotheses & Tanglish natural language parsing.
            </p>
          </div>

          <div className="p-3.5 bg-gray-50 rounded-lg border border-gray-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-900 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-600" />
                Google Maps & Leaflet
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <p className="text-[11px] text-gray-500">
              Dual-engine GIS mapping with automatic CartoDB fallback for zero blank displays.
            </p>
          </div>

          <div className="p-3.5 bg-gray-50 rounded-lg border border-gray-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-900 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-teal-600" />
                Firebase Firestore & Auth
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <p className="text-[11px] text-gray-500">
              Persistence enabled for complaint filings, officer interventions, and verification signatures.
            </p>
          </div>
        </div>
      </div>

      {/* Chennai Corporation 15 Zones Directory */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-gray-900">
              Greater Chennai Corporation Administrative Zones
            </h2>
          </div>
          <span className="text-[11px] text-gray-500 font-mono">15 Regional Zones</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 text-xs">
          {CHENNAI_ZONES.map((z) => (
            <div key={z.id} className="p-2 bg-gray-50 rounded border border-gray-200/80 text-gray-700">
              <span className="font-bold text-gray-900 block text-[11px]">{z.name}</span>
              <span className="text-[10px] text-gray-400">Regional Basin Command</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
