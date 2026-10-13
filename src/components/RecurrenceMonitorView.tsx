import React from 'react';
import { RecurrenceCluster } from '../types';
import { Language, translations } from '../i18n';
import { PriorityScoreBadge } from './PriorityScoreBadge';
import {
  ShieldAlert,
  AlertTriangle,
  Wrench,
  CheckCircle2,
  Calendar,
  Building,
  UserCheck,
  ChevronRight,
  Sparkles,
  FileCheck
} from 'lucide-react';

interface Props {
  clusters: RecurrenceCluster[];
  onSelectCluster: (cluster: RecurrenceCluster) => void;
  currentLang: Language;
}

export const RecurrenceMonitorView: React.FC<Props> = ({
  clusters,
  onSelectCluster,
  currentLang,
}) => {
  const t = translations[currentLang];

  // Filter clusters that have suffered a post-repair relapse
  const relapsedClusters = clusters.filter(
    (cl) => cl.isPostRepairRecurrence || cl.status === 'post_repair_relapse'
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-950/50 via-slate-900 to-indigo-950/40 p-5 rounded-2xl border border-rose-500/40 shadow-xl space-y-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/40">
            <ShieldAlert className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
              <span>{t.recurrenceMonitor}</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 font-semibold">
                {relapsedClusters.length} Relapses Active
              </span>
            </h1>
            <p className="text-xs text-slate-300">
              {currentLang === 'en'
                ? 'Automated sentinel flagging new complaints filed at locations with prior certified repairs within a 90-day defect liability window.'
                : 'சீரமைப்பு பணிகளுக்குப் பிறகு 90 நாட்களுக்குள் மீண்டும் புகார்கள் பதிவாகும் இடங்களை கண்டறிந்து தணிக்கை செய்கிறது.'}
            </p>
          </div>
        </div>
      </div>

      {/* Relapse Warning Cards */}
      {relapsedClusters.length === 0 ? (
        <div className="p-8 text-center bg-slate-800/40 rounded-2xl border border-slate-700/60 text-slate-400 space-y-2">
          <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
          <h3 className="font-semibold text-white">No Active Post-Repair Relapses</h3>
          <p className="text-xs">All recently repaired drainage assets are maintaining full operational clearance.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {relapsedClusters.map((cluster) => {
            const lastRepair = cluster.repairs[cluster.repairs.length - 1];
            const lastInspection = cluster.inspections[cluster.inspections.length - 1];

            return (
              <div
                key={cluster.id}
                className="bg-slate-800/50 rounded-2xl border border-rose-500/40 p-5 shadow-lg space-y-4 hover:border-rose-400 transition"
              >
                {/* Banner Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-700/60">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40">
                        Defect Warranty Breach Alert
                      </span>
                      <span className="text-xs text-slate-400">
                        Cluster: {cluster.id}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white">
                      {cluster.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3">
                    <PriorityScoreBadge
                      score={cluster.priorityScore}
                      breakdown={cluster.priorityBreakdown}
                      size="sm"
                    />
                    <button
                      onClick={() => onSelectCluster(cluster)}
                      className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition cursor-pointer flex items-center gap-1.5 shadow"
                    >
                      <span>Deep Root Cause Audit</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Relapse Timeline & Comparative Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Previous Repair Record */}
                  <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/60 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                      <Wrench className="w-3.5 h-3.5" />
                      <span>Prior Intervention Done</span>
                    </div>
                    <div className="text-xs space-y-1 text-slate-300">
                      <p className="font-medium text-white">{lastRepair?.workType || 'Desilting & Drain Re-lining'}</p>
                      <p className="text-[11px] text-slate-400">
                        Date: {lastRepair ? new Date(lastRepair.workCompletedAt).toLocaleDateString() : 'Sep 18, 2026'}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Officer: {lastRepair?.officerName || 'Er. S. Rajendran'}
                      </p>
                      {lastRepair?.contractorAgency && (
                        <p className="text-[11px] text-slate-400">
                          Agency: {lastRepair.contractorAgency}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Prior Verification Record */}
                  <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/60 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-400">
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Certified Inspection Record</span>
                    </div>
                    <div className="text-xs space-y-1 text-slate-300">
                      <p className="font-medium text-white">
                        {lastInspection?.inspectorDesignation || 'Executive Engineer (SWD)'}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Inspector: {lastInspection?.inspectorName || 'Er. M. Geetha'}
                      </p>
                      <p className="text-[11px] text-emerald-400 font-semibold">
                        Status: Approved Physical Verification
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Silt Depth at Inspection: {lastInspection?.siltLevelCM ?? 5} cm
                      </p>
                    </div>
                  </div>

                  {/* The Recurrence Incident */}
                  <div className="bg-rose-950/30 p-3 rounded-xl border border-rose-500/30 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-400">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>New Complaint Filed</span>
                    </div>
                    <div className="text-xs space-y-1 text-slate-300">
                      <p className="font-bold text-rose-200">
                        Flooded again {cluster.daysBetweenRepairAndRecurrence || 14} days post-repair
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Latest: {new Date(cluster.lastReportedAt).toLocaleDateString()}
                      </p>
                      <p className="text-[11px] text-rose-300 font-semibold">
                        Suspected Cause: Quick-patch superficial desilting failed to solve reverse gradient / outfall obstruction.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Gemini AI Root Cause Diagnostic Summary */}
                {cluster.aiAnalysis && (
                  <div className="bg-slate-900/80 p-3 rounded-xl border border-indigo-900/40 text-xs space-y-1.5">
                    <div className="flex items-center gap-1.5 text-violet-400 font-semibold text-[11px] uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>AI Post-Repair Diagnostic Hypothesis:</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed text-xs">
                      {cluster.aiAnalysis.summary}
                    </p>
                    <div className="pt-1 flex items-center gap-2 text-[11px] text-slate-400">
                      <span className="font-semibold text-amber-300">Recommended Action:</span>
                      <span>{cluster.aiAnalysis.recommendedInspections[0]?.description}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
