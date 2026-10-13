import React, { useState } from 'react';
import { RecurrenceCluster, SystemStats, Complaint } from '../types';
import { Language, translations } from '../i18n';
import { exportDashboardStatsPDF } from '../utils/pdfExport';
import {
  BarChart3,
  FileDown,
  TrendingUp,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Calendar,
  Layers,
  MapPin,
  Clock,
  Printer,
  ChevronRight,
  Activity,
  Award
} from 'lucide-react';

interface Props {
  stats: SystemStats | null;
  clusters: RecurrenceCluster[];
  complaints: Complaint[];
  onSelectCluster: (cluster: RecurrenceCluster) => void;
  currentLang: Language;
}

export const AnalyticsReportsView: React.FC<Props> = ({
  stats,
  clusters,
  complaints,
  onSelectCluster,
  currentLang,
}) => {
  const t = translations[currentLang];
  const [reportType, setReportType] = useState<'citywide' | 'warranty' | 'zonal'>('citywide');

  const relapsedClusters = clusters.filter(
    (c) => c.isPostRepairRecurrence || c.status === 'post_repair_relapse'
  );

  // Group by zone
  const zoneSummary: Record<string, { total: number; relapses: number; avgPriority: number; clusters: RecurrenceCluster[] }> = {};
  clusters.forEach((cl) => {
    if (!zoneSummary[cl.zone]) {
      zoneSummary[cl.zone] = { total: 0, relapses: 0, avgPriority: 0, clusters: [] };
    }
    zoneSummary[cl.zone].total += cl.recurrenceCount;
    if (cl.isPostRepairRecurrence || cl.status === 'post_repair_relapse') {
      zoneSummary[cl.zone].relapses += 1;
    }
    zoneSummary[cl.zone].clusters.push(cl);
  });

  Object.keys(zoneSummary).forEach((z) => {
    const list = zoneSummary[z].clusters;
    zoneSummary[z].avgPriority = Math.round(list.reduce((acc, c) => acc + c.priorityScore, 0) / list.length);
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-indigo-600" />
              <span>Municipal Analytics & Executive Reports</span>
            </h1>
            <span className="text-xs bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded border border-indigo-200 uppercase">
              GCC Regional Command
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Macro analysis of infrastructure failure persistence, contractor durability liability, and formal PDF generation for municipal leadership.
          </p>
        </div>

        <button
          onClick={() => exportDashboardStatsPDF(stats, clusters)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs transition cursor-pointer self-start md:self-auto"
        >
          <FileDown className="w-4 h-4" />
          <span>Export Official PDF Dossier</span>
        </button>
      </div>

      {/* High-level KPI summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4.5 rounded-xl border border-gray-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-semibold uppercase">Citywide Recurrence Rate</span>
            <Activity className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-indigo-700 tabular-nums">
              {stats?.recurrenceRatePct ?? 75}%
            </span>
            <span className="text-xs font-semibold text-rose-600">+4% monsoon surge</span>
          </div>
          <p className="text-[11px] text-gray-400">Share of complaints occurring in recurring hotspots</p>
        </div>

        <div className="bg-white p-4.5 rounded-xl border border-gray-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-semibold uppercase">Contractor Warranty Relapses</span>
            <ShieldAlert className="w-4 h-4 text-rose-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-rose-700 tabular-nums">
              {relapsedClusters.length}
            </span>
            <span className="text-xs font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
              High Liability
            </span>
          </div>
          <p className="text-[11px] text-gray-400">Complaints returning &lt;30 days after repair</p>
        </div>

        <div className="bg-white p-4.5 rounded-xl border border-gray-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-semibold uppercase">Average Resolution Cycle</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-gray-900 tabular-nums">
              {stats?.avgResolutionDays ?? 4.8}
            </span>
            <span className="text-xs text-gray-500 font-medium">days</span>
          </div>
          <p className="text-[11px] text-gray-400">From citizen filing to verified sign-off</p>
        </div>

        <div className="bg-white p-4.5 rounded-xl border border-gray-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-semibold uppercase">Verified Durability Rate</span>
            <CheckCircle2 className="w-4 h-4 text-teal-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-teal-700 tabular-nums">
              {stats?.verifiedRepairs ?? 4}
            </span>
            <span className="text-xs text-teal-700 font-medium">certified works</span>
          </div>
          <p className="text-[11px] text-gray-400">With documented silt &le; 10cm</p>
        </div>
      </div>

      {/* Contractor Durability & Warranty Audit Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span>Contractor Durability & Defect Warranty Audit</span>
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Tracks whether contracted desilting or civil reconstruction held up during subsequent rain events.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-500 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Hotspot & Corridor</th>
                <th className="py-3 px-4">Execution Agency</th>
                <th className="py-3 px-4">Intervention Type</th>
                <th className="py-3 px-4">Cost (INR)</th>
                <th className="py-3 px-4">Elapsed to Relapse</th>
                <th className="py-3 px-4">Audit Assessment</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {relapsedClusters.map((cl) => {
                const latestRepair = cl.repairs[cl.repairs.length - 1];
                return (
                  <tr key={cl.id} className="hover:bg-gray-50/80 transition">
                    <td className="py-3.5 px-4 font-medium text-gray-900">
                      <div className="font-bold">{cl.area}</div>
                      <div className="text-[11px] text-gray-500">{cl.zone} • Ward {cl.ward}</div>
                    </td>

                    <td className="py-3.5 px-4 font-medium text-gray-700">
                      {latestRepair?.contractorAgency || 'M/s Metro Rapid Infra Ltd'}
                    </td>

                    <td className="py-3.5 px-4 text-gray-600">
                      {latestRepair?.workType || 'Stormwater Box Culvert Desilting'}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-gray-800">
                      ₹{(latestRepair?.estimatedCostINR || 145000).toLocaleString('en-IN')}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-rose-700 font-bold bg-rose-50 border border-rose-200 px-2 py-0.5 rounded text-[10px]">
                        {cl.daysBetweenRepairAndRecurrence || 14} Days
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-gray-600">
                      <span className="text-amber-800 font-medium">
                        Quick-patch failure / Hydraulic invert mismatch
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => onSelectCluster(cl)}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer"
                      >
                        Audit Dossier →
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Zone-by-Zone Recurrence Vulnerability Matrix */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-indigo-600" />
              <span>Zonal Recurrence Vulnerability Matrix (15 GCC Zones)</span>
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Aggregated failure frequencies, repeat events, and average priority scores across administrative divisions.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-500 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Zone Division</th>
                <th className="py-3 px-4">Active Hotspots</th>
                <th className="py-3 px-4">Total Repeat Grievances</th>
                <th className="py-3 px-4">Warranty Relapses</th>
                <th className="py-3 px-4">Mean Priority Score</th>
                <th className="py-3 px-4">Vulnerability Index</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {Object.entries(zoneSummary).map(([zName, data]) => (
                <tr key={zName} className="hover:bg-gray-50/80 transition">
                  <td className="py-3 px-4 font-bold text-gray-900">
                    {zName}
                  </td>
                  <td className="py-3 px-4 text-gray-700 tabular-nums">
                    {data.clusters.length}
                  </td>
                  <td className="py-3 px-4 font-semibold text-indigo-700 tabular-nums">
                    {data.total}
                  </td>
                  <td className="py-3 px-4">
                    {data.relapses > 0 ? (
                      <span className="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 text-[10px]">
                        {data.relapses} Breaches
                      </span>
                    ) : (
                      <span className="text-gray-400">0</span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-gray-800">
                    {data.avgPriority}/100
                  </td>
                  <td className="py-3 px-4">
                    <div className="w-32 bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          data.avgPriority >= 80 ? 'bg-rose-500' : data.avgPriority >= 60 ? 'bg-amber-500' : 'bg-indigo-600'
                        }`}
                        style={{ width: `${data.avgPriority}%` }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
