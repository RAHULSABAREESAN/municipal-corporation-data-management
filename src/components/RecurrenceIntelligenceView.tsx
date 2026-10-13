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
  FileDown,
  Wrench,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  ExternalLink,
  Flame,
  CheckCircle
} from 'lucide-react';

interface Props {
  clusters: RecurrenceCluster[];
  onSelectCluster: (cluster: RecurrenceCluster) => void;
  currentLang: Language;
}

export const RecurrenceIntelligenceView: React.FC<Props> = ({
  clusters,
  onSelectCluster,
  currentLang,
}) => {
  const t = translations[currentLang];
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedZone, setSelectedZone] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Summary Metrics
  const activeClustersCount = clusters.length;
  const totalRepeatComplaints = clusters.reduce((acc, c) => acc + c.recurrenceCount, 0);
  const relapsedHotspots = clusters.filter(
    (c) => c.isPostRepairRecurrence || c.status === 'post_repair_relapse'
  );
  const pendingVerifications = clusters.filter(
    (c) => c.status === 'work_completed_pending_inspection' || (c.repairs.length > 0 && c.inspections.length === 0)
  );

  const filteredClusters = clusters.filter((cl) => {
    const matchesSearch =
      cl.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cl.area.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cl.zone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(cl.ward).includes(searchTerm);

    const matchesZone = selectedZone === 'all' || cl.zone.includes(selectedZone);
    const matchesCategory = selectedCategory === 'all' || cl.category === selectedCategory;

    const matchesStatus =
      selectedStatus === 'all' ||
      (selectedStatus === 'relapse' && (cl.isPostRepairRecurrence || cl.status === 'post_repair_relapse')) ||
      (selectedStatus === 'verified' && cl.status === 'verified_resolved') ||
      (selectedStatus === 'pending_inspection' && (cl.status === 'work_completed_pending_inspection' || (cl.repairs.length > 0 && cl.inspections.length === 0))) ||
      (selectedStatus === 'chronic' && cl.status === 'chronic_active');

    return matchesSearch && matchesZone && matchesCategory && matchesStatus;
  });

  const getStatusBadge = (status: string, isRelapse: boolean) => {
    if (isRelapse || status === 'post_repair_relapse') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-50 text-rose-700 border border-rose-200">
          <ShieldAlert className="w-3 h-3 text-rose-600" />
          Repair Repeated / Relapse
        </span>
      );
    }
    switch (status) {
      case 'verified_resolved':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
            <CheckCircle2 className="w-3 h-3 text-teal-600" />
            Verified Resolved
          </span>
        );
      case 'work_completed_pending_inspection':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            Pending Verification
          </span>
        );
      case 'in_remediation':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Wrench className="w-3 h-3 text-indigo-600" />
            Under Investigation
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <AlertCircle className="w-3 h-3 text-blue-600" />
            Chronic Active
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header and Explanation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <Layers className="w-6 h-6 text-indigo-600" />
              <span>Recurrence Intelligence</span>
            </h1>
            <span className="text-xs bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded border border-indigo-200 uppercase">
              Signature Radar
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Pinpoints recurring civic failures returning after past repairs. Correlates terrain topography, hydraulic bottlenecks, and contractor liability.
          </p>
        </div>

        <button
          onClick={() => exportDashboardStatsPDF(null, clusters)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-medium text-xs shadow-2xs transition cursor-pointer self-start md:self-auto"
        >
          <FileDown className="w-4 h-4 text-indigo-600" />
          <span>Export Recurrence Briefing</span>
        </button>
      </div>

      {/* 4 Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Recurring Clusters */}
        <div className="bg-white p-4.5 rounded-xl border border-gray-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Recurring Clusters</span>
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-gray-900 tabular-nums">
              {activeClustersCount}
            </span>
            <span className="text-xs text-gray-500 font-medium">GPS clustered</span>
          </div>
          <p className="text-[11px] text-gray-400">Within ≤ 450m catchment boundary</p>
        </div>

        {/* Repeat Complaints Aggregated */}
        <div className="bg-white p-4.5 rounded-xl border border-gray-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Repeat Complaints</span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-blue-700 tabular-nums">
              {totalRepeatComplaints}
            </span>
            <span className="text-xs text-gray-500 font-medium">citizen grievances</span>
          </div>
          <p className="text-[11px] text-gray-400">Avg {Math.round(totalRepeatComplaints / (activeClustersCount || 1))} reports per recurring hotspot</p>
        </div>

        {/* Overdue / Relapsed Hotspots */}
        <div className="bg-white p-4.5 rounded-xl border border-gray-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Post-Repair Relapses</span>
            <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-rose-700 tabular-nums">
              {relapsedHotspots.length}
            </span>
            <span className="text-xs font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
              Warranty Breach
            </span>
          </div>
          <p className="text-[11px] text-rose-600 font-medium">Flooded &lt; 30d after recorded completion</p>
        </div>

        {/* Pending Verification */}
        <div className="bg-white p-4.5 rounded-xl border border-gray-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Verification</span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-700 tabular-nums">
              {pendingVerifications.length}
            </span>
            <span className="text-xs text-gray-500 font-medium">awaiting QC</span>
          </div>
          <p className="text-[11px] text-gray-400">Requires physical engineer sign-off</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search hotspot, road, ward..."
              className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-xs text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
            />
          </div>

          {/* Zone Selector */}
          <select
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-2 text-xs text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
          >
            <option value="all">{t.allZones}</option>
            {CHENNAI_ZONES.map((z) => (
              <option key={z.id} value={z.name}>
                {z.name}
              </option>
            ))}
          </select>

          {/* Category Selector */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-2 text-xs text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
          >
            <option value="all">All Infrastructure Types</option>
            <option value="Waterlogging & Stormwater">Waterlogging & Stormwater</option>
            <option value="Potholes & Road Damage">Potholes & Road Damage</option>
            <option value="Sewage Overflow">Sewage Overflow</option>
            <option value="Solid Waste / Canal Choking">Solid Waste / Canal Choking</option>
          </select>

          {/* Status Selector */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-2 text-xs text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
          >
            <option value="all">All Recurrence States</option>
            <option value="relapse">⚠️ Post-Repair Relapses Only</option>
            <option value="pending_inspection">⏳ Pending Field Inspection</option>
            <option value="chronic">🔥 Chronic Active</option>
            <option value="verified">✅ Verified Resolved</option>
          </select>
        </div>
      </div>

      {/* Recurrence Clusters Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-500 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Cluster ID & Hotspot</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Zone & Ward</th>
                <th className="py-3 px-4">Recurrence Count</th>
                <th className="py-3 px-4">Report Timeline</th>
                <th className="py-3 px-4">Prior Repairs</th>
                <th className="py-3 px-4">Recurrence Status</th>
                <th className="py-3 px-4">Priority Score</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredClusters.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-gray-400">
                    No recurring hotspots match the current criteria.
                  </td>
                </tr>
              ) : (
                filteredClusters.map((cluster) => {
                  const isRelapse = cluster.isPostRepairRecurrence || cluster.status === 'post_repair_relapse';

                  return (
                    <tr
                      key={cluster.id}
                      onClick={() => onSelectCluster(cluster)}
                      className="hover:bg-gray-50/80 transition cursor-pointer group"
                    >
                      {/* Cluster ID & Hotspot */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-gray-500 text-[11px]">
                            {cluster.id}
                          </span>
                          {cluster.aiAnalysis && (
                            <span className="text-[10px] bg-indigo-50 text-indigo-700 px-1 rounded flex items-center gap-0.5" title="Gemini Hydrology Diagnostics Ready">
                              <Sparkles className="w-2.5 h-2.5 text-indigo-600" />
                              AI Ready
                            </span>
                          )}
                        </div>
                        <div className="font-bold text-gray-900 group-hover:text-indigo-600 transition truncate mt-0.5">
                          {cluster.title}
                        </div>
                        <div className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          <span className="truncate">{cluster.area}</span>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 text-gray-700 font-medium whitespace-nowrap">
                        {cluster.category}
                      </td>

                      {/* Zone & Ward */}
                      <td className="py-3.5 px-4 text-gray-600 whitespace-nowrap">
                        <div className="font-medium text-gray-800">{cluster.zone}</div>
                        <div className="text-[10px] text-gray-400">Ward #{cluster.ward}</div>
                      </td>

                      {/* Recurrence Count */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                          {cluster.recurrenceCount} events
                        </span>
                        <span className="text-[10px] text-gray-400 block mt-0.5">
                          radius ~{cluster.radiusMeters}m
                        </span>
                      </td>

                      {/* Report Timeline */}
                      <td className="py-3.5 px-4 text-gray-600 whitespace-nowrap text-[11px]">
                        <div>Latest: {new Date(cluster.lastReportedAt).toLocaleDateString()}</div>
                        <div className="text-gray-400 text-[10px]">First: {new Date(cluster.firstReportedAt).toLocaleDateString()}</div>
                      </td>

                      {/* Prior Repairs */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-semibold text-gray-700">
                          {cluster.repairs.length} repair(s)
                        </span>
                        {isRelapse && (
                          <span className="text-[10px] text-rose-600 font-semibold block">
                            Failed in {cluster.daysBetweenRepairAndRecurrence || 14}d
                          </span>
                        )}
                      </td>

                      {/* Recurrence Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getStatusBadge(cluster.status, isRelapse)}
                      </td>

                      {/* Priority Score */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <PriorityScoreBadge
                          score={cluster.priorityScore}
                          breakdown={cluster.priorityBreakdown}
                          size="sm"
                        />
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <span className="text-xs font-semibold text-indigo-600 group-hover:text-indigo-700 flex items-center justify-end gap-0.5">
                          <span>Inspect</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
