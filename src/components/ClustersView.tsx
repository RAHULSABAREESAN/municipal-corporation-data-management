import React, { useState } from 'react';
import { RecurrenceCluster, ComplaintCategory } from '../types';
import { PriorityScoreBadge } from './PriorityScoreBadge';
import { Language, translations } from '../i18n';
import { CHENNAI_ZONES } from '../data/mockData';
import { exportDashboardStatsPDF } from '../utils/pdfExport';
import {
  Layers,
  Search,
  Filter,
  MapPin,
  Calendar,
  AlertTriangle,
  ShieldAlert,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  Clock,
  FileDown
} from 'lucide-react';

interface Props {
  clusters: RecurrenceCluster[];
  onSelectCluster: (cluster: RecurrenceCluster) => void;
  currentLang: Language;
}

export const ClustersView: React.FC<Props> = ({
  clusters,
  onSelectCluster,
  currentLang,
}) => {
  const t = translations[currentLang];
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedZone, setSelectedZone] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const filteredClusters = clusters.filter((cl) => {
    const matchesSearch =
      cl.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cl.area.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cl.zone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(cl.ward).includes(searchTerm);

    const matchesZone = selectedZone === 'all' || cl.zone.includes(selectedZone);
    const matchesStatus =
      selectedStatus === 'all' ||
      (selectedStatus === 'relapse' && (cl.isPostRepairRecurrence || cl.status === 'post_repair_relapse')) ||
      (selectedStatus === 'resolved' && cl.status === 'verified_resolved') ||
      (selectedStatus === 'active' && cl.status !== 'verified_resolved');

    return matchesSearch && matchesZone && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-800/50 p-4 rounded-xl border border-slate-700/60">
        <div>
          <h1 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <span>{t.clusters}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Grouped systematically by GPS proximity (&le; 450m), drainage corridor catchment, and repetition timeline.
          </p>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search area, ward, road..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-44 sm:w-56"
            />
          </div>

          {/* Zone Selector */}
          <select
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="all">{t.allZones}</option>
            {CHENNAI_ZONES.map((z) => (
              <option key={z.id} value={z.name}>
                {z.name}
              </option>
            ))}
          </select>

          {/* Status Selector */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Chronic</option>
            <option value="relapse">Post-Repair Relapse</option>
            <option value="resolved">Verified Resolved</option>
          </select>

          {/* Export PDF Button */}
          <button
            onClick={() => exportDashboardStatsPDF(null, filteredClusters)}
            className="px-3 py-1.5 rounded-lg bg-indigo-600/90 hover:bg-indigo-500 text-white font-medium text-xs flex items-center gap-1.5 transition cursor-pointer shadow"
            title="Download formatted PDF briefing of these clusters"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Export PDF Report</span>
          </button>
        </div>
      </div>

      {/* Clusters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredClusters.map((cluster) => {
          const isRelapse =
            cluster.isPostRepairRecurrence ||
            cluster.status === 'post_repair_relapse';

          return (
            <div
              key={cluster.id}
              onClick={() => onSelectCluster(cluster)}
              className={`rounded-xl border p-4 transition cursor-pointer bg-slate-800/40 hover:bg-slate-800/80 flex flex-col justify-between ${
                isRelapse
                  ? 'border-rose-500/50 hover:border-rose-400'
                  : cluster.status === 'verified_resolved'
                  ? 'border-emerald-500/40 hover:border-emerald-400'
                  : 'border-slate-700/60 hover:border-indigo-500/50'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-700/60 text-slate-300">
                      {cluster.id}
                    </span>
                    <h3 className="font-bold text-white text-sm line-clamp-1 group-hover:text-indigo-300 transition">
                      {cluster.title}
                    </h3>
                  </div>
                  <PriorityScoreBadge
                    score={cluster.priorityScore}
                    breakdown={cluster.priorityBreakdown}
                    size="sm"
                  />
                </div>

                {/* Sub info */}
                <div className="text-xs text-slate-300 space-y-1.5 my-2.5">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span className="text-slate-200">{cluster.area}</span>
                    <span>•</span>
                    <span>{cluster.zone} (Ward {cluster.ward})</span>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span className="px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 font-semibold border border-violet-500/30">
                      {cluster.recurrenceCount} Reported Incidents
                    </span>
                    {isRelapse && (
                      <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/40 flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3" />
                        Relapsed in {cluster.daysBetweenRepairAndRecurrence || 14}d
                      </span>
                    )}
                    {cluster.status === 'verified_resolved' && (
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Verified
                      </span>
                    )}
                  </div>
                </div>

                {/* Gemini AI preview */}
                {cluster.aiAnalysis && (
                  <div className="mt-2 p-2.5 rounded-lg bg-slate-900/60 border border-slate-700/50 text-xs text-slate-300 space-y-1">
                    <div className="flex items-center gap-1 text-[10px] uppercase font-semibold text-violet-400">
                      <Sparkles className="w-3 h-3" />
                      <span>AI Root Cause Hypothesis</span>
                    </div>
                    <p className="text-[11px] text-slate-300 line-clamp-2">
                      {cluster.aiAnalysis.hypotheses[0]?.hypothesis || cluster.aiAnalysis.summary}
                    </p>
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="mt-4 pt-3 border-t border-slate-700/40 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1 text-[11px]">
                  <Clock className="w-3 h-3" />
                  First seen: {new Date(cluster.firstReportedAt).toLocaleDateString()}
                </span>
                <span className="text-indigo-400 font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition">
                  {t.viewDetails} <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
