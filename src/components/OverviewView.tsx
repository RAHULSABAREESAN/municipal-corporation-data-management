import React, { useState } from 'react';
import {
  Layers,
  Clock,
  Flame,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  ShieldAlert,
  ArrowUpRight,
  MapPin,
  ChevronRight,
  Sparkles,
  BarChart2,
  Activity,
  FileDown,
  Calendar,
  Filter,
  CheckCircle,
  XCircle,
  FileText,
  Wrench,
  UserCheck
} from 'lucide-react';
import { RecurrenceCluster, SystemStats, Complaint } from '../types';
import { PriorityScoreBadge } from './PriorityScoreBadge';
import { Language, translations } from '../i18n';
import { exportDashboardStatsPDF } from '../utils/pdfExport';

interface Props {
  stats: SystemStats | null;
  clusters: RecurrenceCluster[];
  complaints: Complaint[];
  onSelectCluster: (cluster: RecurrenceCluster) => void;
  onNavigateToTab: (tab: any) => void;
  onOpenReportModal: () => void;
  currentLang: Language;
}

export const OverviewView: React.FC<Props> = ({
  stats,
  clusters,
  complaints,
  onSelectCluster,
  onNavigateToTab,
  onOpenReportModal,
  currentLang,
}) => {
  const t = translations[currentLang];
  const [selectedPeriod, setSelectedPeriod] = useState<'30d' | 'monsoon' | 'year'>('30d');

  // Top critical recurrence hotspots
  const topHotspots = [...clusters]
    .sort((a, b) => b.priorityScore - a.priorityScore)
    .slice(0, 5);

  const relapsedClusters = clusters.filter(
    (c) => c.isPostRepairRecurrence || c.status === 'post_repair_relapse'
  );

  // Complaints by category
  const categoryCounts: Record<string, number> = {};
  complaints.forEach((c) => {
    categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
  });

  const categories = Object.entries(categoryCounts).map(([cat, count]) => ({
    name: cat,
    count,
    percentage: Math.round((count / (complaints.length || 1)) * 100),
  }));

  // Status counts
  const verifiedCount = stats?.verifiedRepairs ?? clusters.reduce((acc, c) => acc + c.inspections.filter(i => i.approvalStatus === 'approved_verified').length, 0);
  const openCount = stats?.unresolvedCases ?? complaints.filter(c => c.status !== 'verified_resolved').length;
  const recurringCount = stats?.recurringIncidents ?? clusters.length;
  const totalCount = stats?.totalComplaints ?? complaints.length;

  // Pending inspections queue
  const pendingInspections = clusters
    .filter((c) => c.status === 'work_completed_pending_inspection' || (c.repairs.length > 0 && c.inspections.length === 0))
    .slice(0, 4);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header / Subtitle & Quick Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              Civic Operations Overview
            </h1>
            <span className="text-xs bg-indigo-50 text-indigo-700 font-semibold px-2 py-0.5 rounded border border-indigo-200">
              Chennai Command
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Monitor complaints, detect recurring failures, and verify lasting resolutions across 15 GCC zones.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Time-period filter */}
          <div className="flex items-center bg-white border border-gray-200 rounded-lg p-0.5 text-xs font-medium text-gray-600 shadow-2xs">
            <button
              onClick={() => setSelectedPeriod('30d')}
              className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                selectedPeriod === '30d' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'hover:text-gray-900'
              }`}
            >
              Last 30 Days
            </button>
            <button
              onClick={() => setSelectedPeriod('monsoon')}
              className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                selectedPeriod === 'monsoon' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'hover:text-gray-900'
              }`}
            >
              Monsoon Season
            </button>
            <button
              onClick={() => setSelectedPeriod('year')}
              className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                selectedPeriod === 'year' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'hover:text-gray-900'
              }`}
            >
              YTD 2026
            </button>
          </div>

          {/* Export Report button */}
          <button
            onClick={() => exportDashboardStatsPDF(stats, clusters)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-medium text-xs shadow-2xs transition cursor-pointer"
            title="Download executive PDF briefing"
          >
            <FileDown className="w-3.5 h-3.5 text-indigo-600" />
            <span>Export Report</span>
          </button>

          {/* Report Complaint button */}
          <button
            onClick={onOpenReportModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs shadow-xs transition cursor-pointer"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Report Complaint</span>
          </button>
        </div>
      </div>

      {/* Post-Repair Relapse Alert Banner */}
      {relapsedClusters.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-rose-100 text-rose-700 shrink-0 mt-0.5">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-rose-900 uppercase tracking-wider">
                  Post-Repair Defect Relapse Alert
                </h3>
                <span className="text-[10px] bg-rose-200 text-rose-800 font-bold px-1.5 py-0.5 rounded">
                  {relapsedClusters.length} Hotspots Breached
                </span>
              </div>
              <p className="text-xs text-rose-700 mt-0.5 max-w-3xl leading-relaxed">
                New waterlogging complaints were registered at {relapsedClusters.map((c) => c.area.split(' ')[0]).slice(0, 3).join(', ')} within 30 days of completed repair works. Indicates drainage invert elevation error or tidal backpressure.
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigateToTab('recurrence')}
            className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs transition cursor-pointer self-start md:self-center whitespace-nowrap shadow-xs"
          >
            Audit Warranty Relapses →
          </button>
        </div>
      )}

      {/* 4 Primary Operational KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total Complaints */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-medium uppercase tracking-wider">Total Complaints</span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-gray-900 tracking-tight tabular-nums">
                {totalCount}
              </span>
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" /> +12% vs last month
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1">
              <span>Chennai citywide intake</span>
              <span className="font-mono text-gray-600">15 Zones</span>
            </div>
          </div>
          {/* Subtle progress bar */}
          <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-600 rounded-full w-[70%]" />
          </div>
        </div>

        {/* 2. Open Complaints */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-medium uppercase tracking-wider">Open Complaints</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-amber-700 tracking-tight tabular-nums">
                {openCount}
              </span>
              <span className="text-xs text-gray-500">under active SLA</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1">
              <span>Avg turnaround: {stats?.avgResolutionDays ?? 4.8} days</span>
              <span className="font-semibold text-amber-700">{Math.round((openCount / (totalCount || 1)) * 100)}% pending</span>
            </div>
          </div>
          <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.round((openCount / (totalCount || 1)) * 100)}%` }} />
          </div>
        </div>

        {/* 3. Recurring Issues Detected (Signature Metric) */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-medium uppercase tracking-wider">Recurring Hotspots</span>
            <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-gray-900 tracking-tight tabular-nums">
                {recurringCount}
              </span>
              <span className="text-xs font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                {stats?.recurrenceRatePct ?? 75}% Rate
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1">
              <span>{relapsedClusters.length} post-repair alarms</span>
              <span className="font-semibold text-rose-600">High Defect Risk</span>
            </div>
          </div>
          <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-rose-500 rounded-full w-[75%]" />
          </div>
        </div>

        {/* 4. Verified Resolutions */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-medium uppercase tracking-wider">Verified Resolutions</span>
            <div className="p-2 rounded-lg bg-teal-50 text-teal-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-teal-700 tracking-tight tabular-nums">
                {verifiedCount}
              </span>
              <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                100% Certified
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1">
              <span>Two-gate sign-off enforced</span>
              <span className="text-teal-700 font-medium">Physical QC</span>
            </div>
          </div>
          <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-teal-600 rounded-full w-[85%]" />
          </div>
        </div>
      </div>

      {/* Visual Analytics Row: Trends & Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Bar Chart */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-gray-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-600" />
                <span>Complaint Intake & Recurrence Surge Trend</span>
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Weekly volume tracking citizen filings vs clustered recurrent incidents
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-indigo-600" />
                <span className="text-gray-600">Total Filings</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
                <span className="text-gray-600">Recurrent Clusters</span>
              </div>
            </div>
          </div>

          {/* Simple Clean Responsive Bar Chart */}
          <div className="pt-4 grid grid-cols-7 gap-2 sm:gap-4 items-end h-44 border-b border-gray-200 pb-2">
            {[
              { day: 'Mon', total: 18, recurrent: 12 },
              { day: 'Tue', total: 24, recurrent: 17 },
              { day: 'Wed', total: 31, recurrent: 22 },
              { day: 'Thu', total: 15, recurrent: 9 },
              { day: 'Fri', total: 28, recurrent: 20 },
              { day: 'Sat', total: 35, recurrent: 27 },
              { day: 'Sun', total: 22, recurrent: 15 },
            ].map((d) => (
              <div key={d.day} className="flex flex-col items-center gap-1.5 h-full justify-end group">
                <div className="w-full flex items-end justify-center gap-1 sm:gap-1.5 h-32">
                  <div
                    className="w-3 sm:w-5 bg-indigo-600 rounded-t-sm transition-all group-hover:bg-indigo-700"
                    style={{ height: `${(d.total / 35) * 100}%` }}
                    title={`${d.day}: ${d.total} Complaints`}
                  />
                  <div
                    className="w-3 sm:w-5 bg-rose-500 rounded-t-sm transition-all group-hover:bg-rose-600"
                    style={{ height: `${(d.recurrent / 35) * 100}%` }}
                    title={`${d.day}: ${d.recurrent} Recurrent Hotspots`}
                  />
                </div>
                <span className="text-[11px] font-medium text-gray-500">{d.day}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
            <span>Peak rainfall correlation observed on Saturday (35 complaints, 27 recurrent hotspots)</span>
            <span className="text-indigo-600 font-semibold cursor-pointer" onClick={() => onNavigateToTab('analytics')}>
              View Detailed Analytics →
            </span>
          </div>
        </div>

        {/* Category Breakdown & Distribution */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-indigo-600" />
              <span>Category Distribution</span>
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Breakdown by municipal infrastructure type
            </p>
          </div>

          <div className="space-y-3 pt-1">
            {categories.map((c) => (
              <div key={c.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-gray-800 truncate max-w-[180px]">{c.name}</span>
                  <span className="font-bold text-gray-900 tabular-nums">
                    {c.count} ({c.percentage}%)
                  </span>
                </div>
                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      c.name.includes('Waterlogging')
                        ? 'bg-indigo-600'
                        : c.name.includes('Pothole')
                        ? 'bg-amber-500'
                        : c.name.includes('Sewage')
                        ? 'bg-rose-500'
                        : 'bg-teal-500'
                    }`}
                    style={{ width: `${c.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid: Chronic Recurrence Hotspots & Zonal Rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chronic Recurrence Hotspots Table (2 Columns) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <span>Chronic Recurrence Hotspots</span>
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                  Ranked by Priority Score
                </span>
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Incidents experiencing repeated failures, high public impact, and defect liability risk
              </p>
            </div>

            <button
              onClick={() => onNavigateToTab('recurrence')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
            >
              <span>View All Clusters</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-gray-100">
            {topHotspots.map((cluster) => {
              const isRelapse = cluster.isPostRepairRecurrence || cluster.status === 'post_repair_relapse';

              return (
                <div
                  key={cluster.id}
                  onClick={() => onSelectCluster(cluster)}
                  className="p-4 hover:bg-gray-50/80 transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono font-semibold text-gray-500">
                        {cluster.id}
                      </span>
                      <h3 className="font-bold text-gray-900 text-xs sm:text-sm group-hover:text-indigo-600 transition truncate">
                        {cluster.title}
                      </h3>
                      {isRelapse && (
                        <span className="text-[10px] font-bold uppercase bg-rose-50 text-rose-700 px-2 py-0.5 rounded border border-rose-200">
                          Relapse ({cluster.daysBetweenRepairAndRecurrence || 14}d)
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1 text-gray-700">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        {cluster.area}
                      </span>
                      <span>•</span>
                      <span>{cluster.zone} (Ward {cluster.ward})</span>
                      <span>•</span>
                      <span className="font-semibold text-indigo-600">
                        {cluster.recurrenceCount} repeated events
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                    <PriorityScoreBadge
                      score={cluster.priorityScore}
                      breakdown={cluster.priorityBreakdown}
                      size="sm"
                    />
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Chennai Vulnerability Ranking & Inspection Queue */}
        <div className="space-y-6">
          {/* Vulnerability Ranking Card */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-indigo-600" />
                <span>Vulnerable Zones Ranking</span>
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Hotspot density across Greater Chennai Corporation
              </p>
            </div>

            <div className="space-y-3">
              {(stats?.topVulnerableZones || [
                { zone: 'Zone 13 - Adyar', count: 4 },
                { zone: 'Zone 10 - Kodambakkam', count: 3 },
                { zone: 'Zone 14 - Perungudi', count: 3 },
                { zone: 'Zone 6 - Thiru-Vi-Ka Nagar', count: 2 },
                { zone: 'Zone 4 - Tondiarpet', count: 1 },
              ]).map((item, idx) => (
                <div key={item.zone} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-gray-800">
                      #{idx + 1} {item.zone}
                    </span>
                    <span className="text-indigo-700 font-bold tabular-nums">
                      {item.count} recurring
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, (item.count / 4) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Verification Queue Preview */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-amber-600" />
                  <span>Verification Queue</span>
                </h3>
                <p className="text-xs text-gray-500">Repairs awaiting physical inspection sign-off</p>
              </div>
              <button
                onClick={() => onNavigateToTab('inspections')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer"
              >
                Go to Hub →
              </button>
            </div>

            <div className="space-y-2 pt-1">
              {pendingInspections.length === 0 ? (
                <p className="text-xs text-gray-500 py-2">No pending inspection sign-offs at this time.</p>
              ) : (
                pendingInspections.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => onSelectCluster(c)}
                    className="p-2.5 rounded-lg border border-gray-200 bg-gray-50/50 hover:bg-gray-100 transition cursor-pointer flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-900 truncate">{c.area}</p>
                      <p className="text-[11px] text-gray-500">{c.zone} • {c.repairs.length} repair logged</p>
                    </div>
                    <span className="text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded whitespace-nowrap">
                      Pending QC
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* AI Operational Advisory Box */}
          <div className="bg-indigo-50/70 p-4 rounded-xl border border-indigo-100 text-xs space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-indigo-900 text-xs">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Gemini Operational Advisory</span>
            </div>
            <p className="text-gray-600 leading-relaxed text-[11px]">
              Hydrological telemetry shows tidal backpressure along the Buckingham Canal is currently throttling gravity discharge at Velachery (Ward 178) and Stephenson Road (Ward 72).
            </p>
            <button
              onClick={() => onNavigateToTab('chatbot')}
              className="text-xs font-bold text-indigo-700 hover:text-indigo-800 flex items-center gap-1 cursor-pointer pt-1"
            >
              <span>Consult AI Hydrology Specialist</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
