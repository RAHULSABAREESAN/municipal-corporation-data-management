import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Layers,
  ArrowUpRight,
  ShieldAlert,
  Flame,
  ChevronRight,
  TrendingUp,
  MapPin,
  Sparkles,
  FileDown
} from 'lucide-react';
import { RecurrenceCluster, SystemStats } from '../types';
import { PriorityScoreBadge } from './PriorityScoreBadge';
import { Language, translations } from '../i18n';
import { exportDashboardStatsPDF } from '../utils/pdfExport';

interface Props {
  stats: SystemStats | null;
  clusters: RecurrenceCluster[];
  onSelectCluster: (cluster: RecurrenceCluster) => void;
  onOpenReportModal: () => void;
  currentLang: Language;
}

export const DashboardView: React.FC<Props> = ({
  stats,
  clusters,
  onSelectCluster,
  onOpenReportModal,
  currentLang,
}) => {
  const t = translations[currentLang];
  const [filter, setFilter] = useState<'all' | 'critical' | 'relapse'>('all');

  const filteredClusters = clusters.filter((cl) => {
    if (filter === 'critical') return cl.priorityScore >= 80;
    if (filter === 'relapse') return cl.isPostRepairRecurrence || cl.status === 'post_repair_relapse';
    return true;
  });

  const topPriorityClusters = [...filteredClusters].sort(
    (a, b) => b.priorityScore - a.priorityScore
  );

  return (
    <div className="space-y-6">
      {/* Top Welcome / Situation Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-900/60 via-indigo-950/80 to-purple-950/60 p-5 md:p-6 border border-indigo-700/40 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-2 border border-indigo-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>GCC Monsoon Readiness & Recurrence Radar</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              {currentLang === 'en'
                ? 'Greater Chennai Recurrence Intelligence'
                : 'சென்னை மாநகராட்சி தொடர் வெள்ள நுண்ணறிவு மேலாண்மை'}
            </h1>
            <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              {currentLang === 'en'
                ? 'Pinpointing systemic municipal drainage bottlenecks, contractor repair relapse risks, and automated root cause hypotheses across 15 GCC zones.'
                : '15 மண்டலங்களில் மீண்டும் மீண்டும் நிகழும் மழைநீர் வடிகால் தடைகள், சீரமைப்பிற்கு பின் மீண்டும் ஏற்படும் சிக்கல்கள் மற்றும் AI அனுமானங்களை கண்டறிகிறது.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => exportDashboardStatsPDF(stats, clusters)}
              className="px-3.5 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white font-medium text-xs md:text-sm border border-slate-700 shadow-md transition cursor-pointer flex items-center gap-2"
              title="Export official citywide briefing PDF for GCC administration"
            >
              <FileDown className="w-4 h-4 text-indigo-400" />
              <span>Export Executive Briefing PDF</span>
            </button>

            <button
              onClick={onOpenReportModal}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs md:text-sm shadow-lg shadow-indigo-600/30 transition cursor-pointer flex items-center gap-2"
            >
              <span>{t.fileComplaint}</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {/* Total Complaints */}
        <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:border-indigo-500/40 transition">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>{t.totalComplaints}</span>
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-extrabold text-white">
              {stats?.totalComplaints ?? 16}
            </span>
            <span className="text-xs text-slate-400">active items</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Across 15 GCC Chennai zones
          </div>
        </div>

        {/* Unresolved Cases */}
        <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:border-amber-500/40 transition">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>{t.unresolvedCases}</span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-extrabold text-amber-400">
              {stats?.unresolvedCases ?? 13}
            </span>
            <span className="text-xs text-amber-500/80">pending</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Avg resolution time: {stats?.avgResolutionDays ?? 4.8} days
          </div>
        </div>

        {/* Recurring Incidents */}
        <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:border-violet-500/40 transition">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>{t.recurringIncidents}</span>
            <div className="p-1.5 rounded-lg bg-violet-500/10 text-violet-400">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-extrabold text-violet-300">
              {stats?.recurringIncidents ?? 9}
            </span>
            <span className="text-xs font-semibold text-violet-400">
              {stats?.recurrenceRatePct ?? 75}% rate
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Clustered via proximity & semantics
          </div>
        </div>

        {/* Verified Repairs */}
        <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:border-emerald-500/40 transition">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>{t.verifiedRepairs}</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-extrabold text-emerald-400">
              {stats?.verifiedRepairs ?? 4}
            </span>
            <span className="text-xs text-emerald-500/80">officer signed</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Mandatory inspection verified
          </div>
        </div>
      </div>

      {/* Post-Repair Relapse Alert Card */}
      {(stats?.postRepairRelapses ?? 0) > 0 && (
        <div className="rounded-xl border border-rose-500/40 bg-gradient-to-r from-rose-950/40 via-slate-900 to-rose-950/30 p-4 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400 shrink-0 mt-0.5">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-rose-300">
                  {currentLang === 'en'
                    ? `⚠️ ${stats?.postRepairRelapses} Post-Repair Relapse Alerts Detected`
                    : `⚠️ சீரமைப்பிற்கு பின் ${stats?.postRepairRelapses} இடங்களில் மீண்டும் வெள்ளநீர் பாதிப்பு`}
                </h3>
                <span className="px-2 py-0.5 text-[10px] uppercase font-bold rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  Urgent Audit
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                {currentLang === 'en'
                  ? 'Citizens reported fresh water stagnation at Velachery, T. Nagar, Madipakkam, and Vyasarpadi within 30 days of officially completed desilting/repair works. Possible quick-patch failure or systemic drainage backflow.'
                  : 'வேளச்சேரி, தி நகர் மற்றும் வியாசர்பாடியில் சீரமைப்பு செய்யப்பட்ட 30 நாட்களுக்குள் மீண்டும் புகார்கள் பதிவாகியுள்ளன.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setFilter('relapse')}
            className="px-3.5 py-1.5 rounded-lg bg-rose-600/80 hover:bg-rose-500 text-white font-medium text-xs transition cursor-pointer self-start md:self-center whitespace-nowrap"
          >
            {currentLang === 'en' ? 'Audit Relapse Sites' : 'மறுநிகழ்வு இடங்களை காண்க'}
          </button>
        </div>
      )}

      {/* Main Analysis Section: Priority Recurrence Clusters & Zone Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recurring Incident Clusters Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>{t.clusters}</span>
                <span className="text-xs font-normal text-slate-400">
                  ({topPriorityClusters.length} identified)
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Sorted by transparent multi-factor priority score
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center bg-slate-800 rounded-lg p-1 border border-slate-700 text-xs">
              <button
                onClick={() => setFilter('all')}
                className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                  filter === 'all'
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All ({clusters.length})
              </button>
              <button
                onClick={() => setFilter('critical')}
                className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                  filter === 'critical'
                    ? 'bg-rose-600 text-white font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Critical (Score &ge; 80)
              </button>
              <button
                onClick={() => setFilter('relapse')}
                className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                  filter === 'relapse'
                    ? 'bg-amber-600 text-white font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Relapses
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {topPriorityClusters.map((cluster) => {
              const isRelapse =
                cluster.isPostRepairRecurrence ||
                cluster.status === 'post_repair_relapse';

              return (
                <div
                  key={cluster.id}
                  onClick={() => onSelectCluster(cluster)}
                  className={`group p-4 rounded-xl border transition cursor-pointer bg-slate-800/50 hover:bg-slate-800/90 ${
                    isRelapse
                      ? 'border-rose-500/40 hover:border-rose-400'
                      : 'border-slate-700/60 hover:border-indigo-500/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-white group-hover:text-indigo-300 transition text-sm">
                          {cluster.title}
                        </span>
                        {isRelapse && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                            <ShieldAlert className="w-3 h-3" />
                            Relapse ({cluster.daysBetweenRepairAndRecurrence || 14}d after repair)
                          </span>
                        )}
                        <span className="text-[11px] px-2 py-0.5 rounded bg-slate-700/60 text-slate-300">
                          {cluster.zone} • Ward {cluster.ward}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-400 pt-0.5">
                        <span className="flex items-center gap-1 text-slate-300">
                          <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                          {cluster.area}
                        </span>
                        <span>•</span>
                        <span className="text-violet-300 font-medium">
                          {cluster.recurrenceCount} repeated complaints
                        </span>
                        <span>•</span>
                        <span>
                          Radius: ~{cluster.radiusMeters}m
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0 flex flex-col items-end gap-1.5">
                      <PriorityScoreBadge
                        score={cluster.priorityScore}
                        breakdown={cluster.priorityBreakdown}
                      />
                      <span className="text-[11px] text-slate-400 flex items-center gap-0.5 group-hover:text-indigo-400 transition">
                        View Details <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>

                  {/* Root cause hypothesis preview */}
                  {cluster.aiAnalysis && (
                    <div className="mt-3 pt-2.5 border-t border-slate-700/50 flex items-start gap-2 text-xs text-slate-300 bg-slate-900/40 rounded-lg p-2.5">
                      <Sparkles className="w-3.5 h-3.5 text-violet-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-violet-300 text-[11px] uppercase tracking-wider block">
                          AI Root Cause Hypothesis:
                        </span>
                        <p className="line-clamp-2 text-slate-300 text-xs">
                          {cluster.aiAnalysis.hypotheses[0]?.hypothesis || cluster.aiAnalysis.summary}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Sidebar: Top Vulnerable Zones & Recurrence Analytics */}
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              <span>Chennai Vulnerability Ranking</span>
            </h3>

            <div className="space-y-2.5">
              {(stats?.topVulnerableZones || [
                { zone: 'Zone 13 - Adyar', count: 4 },
                { zone: 'Zone 10 - Kodambakkam', count: 3 },
                { zone: 'Zone 14 - Perungudi', count: 3 },
                { zone: 'Zone 4 - Tondiarpet', count: 2 },
                { zone: 'Zone 6 - Thiru-Vi-Ka Nagar', count: 2 },
              ]).map((item, idx) => (
                <div key={item.zone} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-200">
                      #{idx + 1} {item.zone}
                    </span>
                    <span className="text-indigo-400 font-bold">
                      {item.count} recurring clusters
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                      style={{
                        width: `${Math.min(100, (item.count / 5) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Transparent Scoring Formula Card */}
          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 text-xs space-y-3">
            <h4 className="font-bold text-indigo-300 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              <span>Transparent Priority Engine</span>
            </h4>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              CivicLoop AI computes an objective 0–100 priority score ensuring chronic municipal issues are never buried under single noisy complaints:
            </p>
            <div className="p-2.5 rounded-lg bg-slate-900/80 font-mono text-[10px] text-indigo-200 border border-indigo-900/50 leading-relaxed">
              Score = (Recurrence × 10) + Severity[15-30] + Duration[2-20] + Relapse Penalty[+12]
            </div>
            <p className="text-[10px] text-slate-400">
              Locations recurring after previous repair automatically gain high urgency for contractor warranty audit.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
