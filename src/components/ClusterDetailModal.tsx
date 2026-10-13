import React, { useState } from 'react';
import {
  RecurrenceCluster,
  Complaint,
  AIAnalysis,
  RootCauseHypothesis,
  RecommendedInspection
} from '../types';
import { PriorityScoreBadge } from './PriorityScoreBadge';
import { Language, translations } from '../i18n';
import { exportClusterReportPDF } from '../utils/pdfExport';
import {
  X,
  Sparkles,
  MapPin,
  Calendar,
  Layers,
  ShieldAlert,
  AlertTriangle,
  Wrench,
  ClipboardCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  Info,
  CheckCircle,
  FileText,
  FileDown,
  Camera,
  User,
  ShieldCheck,
  HelpCircle
} from 'lucide-react';

interface Props {
  cluster: RecurrenceCluster;
  onClose: () => void;
  onClusterUpdated: (updatedCluster: RecurrenceCluster) => void;
  currentLang: Language;
}

export const ClusterDetailModal: React.FC<Props> = ({
  cluster,
  onClose,
  onClusterUpdated,
  currentLang,
}) => {
  const t = translations[currentLang];
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoadingComplaints, setIsLoadingComplaints] = useState(false);
  const [isAnalyzingGemini, setIsAnalyzingGemini] = useState(false);
  const [activeTab, setActiveTab] = useState<'fingerprint' | 'root_cause' | 'complaints' | 'repairs' | 'priority'>('fingerprint');

  // Quick Action Form Modals
  const [showLogRepairModal, setShowLogRepairModal] = useState(false);
  const [showLogInspectionModal, setShowLogInspectionModal] = useState(false);

  // Form states
  const [repairOfficer, setRepairOfficer] = useState('Er. S. Rajendran');
  const [repairWorkType, setRepairWorkType] = useState('Box Culvert Desilting & Sump Cleanout');
  const [repairContractor, setRepairContractor] = useState('Metro Rapid Infra Ltd');
  const [repairDesc, setRepairDesc] = useState('Excavated and cleared 14 cubic meters of hardened sludge. Repaired damaged grate.');
  const [repairCost, setRepairCost] = useState(120000);

  const [inspectOfficer, setInspectOfficer] = useState('Er. M. Geetha');
  const [inspectFindings, setInspectFindings] = useState('Verified 100% unobstructed gravity flow. Measured silt level 4cm.');
  const [inspectSilt, setInspectSilt] = useState(4);
  const [inspectApproval, setInspectApproval] = useState<'approved_verified' | 'rejected_rework_needed'>('approved_verified');

  // Load complaints for this cluster
  React.useEffect(() => {
    async function loadData() {
      setIsLoadingComplaints(true);
      try {
        const res = await fetch('/api/complaints');
        if (res.ok) {
          const allComplaints: Complaint[] = await res.json();
          const matched = allComplaints.filter(
            (c) => c.clusterId === cluster.id || cluster.complaintIds.includes(c.id)
          );
          setComplaints(matched);
        }
      } catch (err) {
        console.error('Failed to load cluster complaints:', err);
      } finally {
        setIsLoadingComplaints(false);
      }
    }
    loadData();
  }, [cluster.id, cluster.complaintIds]);

  const handleTriggerGeminiAnalysis = async () => {
    setIsAnalyzingGemini(true);
    try {
      const res = await fetch('/api/analyze-root-cause', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clusterId: cluster.id }),
      });
      if (res.ok) {
        const data = await res.json();
        onClusterUpdated(data.cluster);
      }
    } catch (err) {
      console.error('Root cause analysis error:', err);
    } finally {
      setIsAnalyzingGemini(false);
    }
  };

  const handleSaveRepair = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/clusters/${cluster.id}/repair`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          officerName: repairOfficer,
          officerDesignation: 'Assistant Executive Engineer',
          contractorAgency: repairContractor,
          workType: repairWorkType,
          description: repairDesc,
          estimatedCostINR: repairCost,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        onClusterUpdated(data.cluster);
        setShowLogRepairModal(false);
      }
    } catch (err) {
      console.error('Error logging repair:', err);
    }
  };

  const handleSaveInspection = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/clusters/${cluster.id}/inspection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inspectorName: inspectOfficer,
          inspectorDesignation: 'Executive Engineer (SWD QC)',
          inspectionFindings: inspectFindings,
          waterFlowClearanceObserved: true,
          siltLevelCM: inspectSilt,
          approvalStatus: inspectApproval,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        onClusterUpdated(data.cluster);
        setShowLogInspectionModal(false);
      }
    } catch (err) {
      console.error('Error recording inspection:', err);
    }
  };

  const isRelapse = cluster.isPostRepairRecurrence || cluster.status === 'post_repair_relapse';

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-xl border border-gray-200 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-gray-200 bg-gray-50/70 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                {cluster.id}
              </span>
              <span className="text-xs text-gray-500 font-medium">
                {cluster.zone} • Ward {cluster.ward}
              </span>
              {isRelapse && (
                <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3 text-rose-600 animate-pulse" />
                  Post-Repair Relapse ({cluster.daysBetweenRepairAndRecurrence || 14}d after repair)
                </span>
              )}
            </div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">
              {cluster.title}
            </h2>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <MapPin className="w-3.5 h-3.5 text-indigo-600" />
              <span>{cluster.area}</span>
              <span>•</span>
              <span className="text-indigo-600 font-semibold">
                {cluster.recurrenceCount} Recurring Complaints
              </span>
              <span>•</span>
              <span className="capitalize text-gray-600">
                Status: {cluster.status.replace(/_/g, ' ')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => exportClusterReportPDF(cluster, complaints)}
              className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
              title="Download official GCC investigation dossier PDF"
            >
              <FileDown className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">Export PDF Dossier</span>
            </button>
            <PriorityScoreBadge
              score={cluster.priorityScore}
              breakdown={cluster.priorityBreakdown}
            />
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 border-b border-gray-200 bg-white flex items-center gap-2 text-xs font-medium overflow-x-auto">
          <button
            onClick={() => setActiveTab('fingerprint')}
            className={`py-3 px-3 border-b-2 font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'fingerprint'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Recurrence Fingerprint</span>
          </button>

          <button
            onClick={() => setActiveTab('root_cause')}
            className={`py-3 px-3 border-b-2 font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'root_cause'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Root-Cause Hypotheses (AI)</span>
          </button>

          <button
            onClick={() => setActiveTab('complaints')}
            className={`py-3 px-3 border-b-2 font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'complaints'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Chronological Incidents ({cluster.recurrenceCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('repairs')}
            className={`py-3 px-3 border-b-2 font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'repairs'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Interventions & Inspections ({cluster.repairs.length + cluster.inspections.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('priority')}
            className={`py-3 px-3 border-b-2 font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'priority'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            <span>Priority Score Math</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 p-5 overflow-y-auto space-y-5 bg-[#F6F8FC]/50 text-xs">
          {/* TAB 0: RECURRENCE FINGERPRINT */}
          {activeTab === 'fingerprint' && (
            <div className="space-y-4">
              {/* Header Box */}
              <div className="bg-white p-4.5 rounded-xl border border-gray-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-gray-500">{cluster.id}</span>
                    <span className="text-xs font-bold text-gray-900">Automated Recurrence Fingerprint</span>
                  </div>
                  <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
                    {cluster.fingerprint?.confidenceLevel || 'High (Verified Physical Data)'}
                  </span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {cluster.fingerprint?.confidenceRationale ||
                    `Correlated across ${cluster.recurrenceCount} incident timestamps, ${cluster.repairs.length} engineering repair logs, and physical distance correlation <= ${cluster.radiusMeters}m.`}
                </p>

                {/* 4 Metadata Stat Pills */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                  <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="text-[10px] text-gray-400 block font-semibold">Incident Count</span>
                    <span className="text-sm font-extrabold text-gray-900 tabular-nums">
                      {cluster.recurrenceCount} events
                    </span>
                  </div>
                  <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="text-[10px] text-gray-400 block font-semibold">Previous Repairs</span>
                    <span className="text-sm font-extrabold text-gray-900 tabular-nums">
                      {cluster.repairs.length} works
                    </span>
                  </div>
                  <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="text-[10px] text-gray-400 block font-semibold">Ground Inspections</span>
                    <span className="text-sm font-extrabold text-teal-700 tabular-nums">
                      {cluster.inspections.length} certified
                    </span>
                  </div>
                  <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="text-[10px] text-gray-400 block font-semibold">Warranty Status</span>
                    <span className="text-sm font-extrabold text-rose-700">
                      {isRelapse ? `${cluster.daysBetweenRepairAndRecurrence || 18}d Relapse` : 'Normal'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Data Category Distinction Matrix (Verified Facts vs Hypotheses vs Citizen Reports) */}
              <div className="bg-white p-4.5 rounded-xl border border-gray-200 shadow-2xs space-y-3">
                <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider text-[11px]">
                  Data Quality & Source Provenance Matrix
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-900 text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Verified Physical Inspection Facts</span>
                    </div>
                    <p className="text-emerald-900 text-[11px] leading-relaxed">
                      {cluster.inspections.length > 0
                        ? `Inspector ${cluster.inspections[0].inspectorName} measured silt depth: ${cluster.inspections[0].siltLevelCM}cm with gravity flow clearance.`
                        : 'No official ground inspection recorded yet. Awaiting physical engineer sign-off.'}
                    </p>
                  </div>

                  <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-lg space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-indigo-900 text-xs">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      <span>AI Diagnostic Hypotheses</span>
                    </div>
                    <p className="text-indigo-900 text-[11px] leading-relaxed">
                      {cluster.aiAnalysis?.hypotheses[0]?.title || 'Reverse Gradient & Macro-Drain Backwater Pressure'}:
                      Tidal backpressure along Buckingham canal restricts discharge. (Requires field leveling verification).
                    </p>
                  </div>

                  <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-amber-900 text-xs">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      <span>Unverified Citizen Telemetry</span>
                    </div>
                    <p className="text-amber-900 text-[11px] leading-relaxed">
                      {cluster.recurrenceCount} public reports with photo evidence. Reports reflect visible water stagnation depth before physical silt measurement.
                    </p>
                  </div>

                  <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-blue-900 text-xs">
                      <Wrench className="w-3.5 h-3.5 text-blue-600" />
                      <span>Contractor Intervention Record</span>
                    </div>
                    <p className="text-blue-900 text-[11px] leading-relaxed">
                      {cluster.repairs.length > 0
                        ? `${cluster.repairs[0].workType} by ${cluster.repairs[0].contractorAgency || 'GCC'} (Cost: ₹${cluster.repairs[0].estimatedCostINR?.toLocaleString('en-IN') || '0'}).`
                        : 'No civil repair contracts on file for this corridor.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Integrated Chronological Event Fingerprint Timeline */}
              <div className="bg-white p-4.5 rounded-xl border border-gray-200 shadow-2xs space-y-3">
                <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider text-[11px]">
                  Chronological Incident, Repair & Inspection Fingerprint
                </h4>
                <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
                  {/* Complaints */}
                  {complaints.map((c, idx) => (
                    <div key={c.id} className="relative">
                      <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-indigo-600 border-2 border-white shadow-xs" />
                      <div className="space-y-0.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-gray-900 text-xs">
                            Citizen Grievance #{idx + 1} ({c.id})
                          </span>
                          <span className="text-[10px] text-gray-400 font-mono">
                            {new Date(c.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-600 text-[11px]">{c.title}</p>
                      </div>
                    </div>
                  ))}

                  {/* Repairs */}
                  {cluster.repairs.map((r) => (
                    <div key={r.id} className="relative">
                      <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-blue-600 border-2 border-white shadow-xs" />
                      <div className="space-y-0.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-blue-900 text-xs">
                            Civil Intervention Logged ({r.id})
                          </span>
                          <span className="text-[10px] text-gray-400 font-mono">
                            {new Date(r.interventionDate || r.workCompletedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-600 text-[11px]">{r.workType} by {r.contractorAgency || 'GCC'}</p>
                      </div>
                    </div>
                  ))}

                  {/* Relapse if any */}
                  {isRelapse && (
                    <div className="relative">
                      <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-rose-600 border-2 border-white shadow-xs animate-pulse" />
                      <div className="space-y-0.5 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-rose-900 text-xs flex items-center gap-1">
                            <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                            Post-Repair Warranty Relapse Detected
                          </span>
                          <span className="text-[10px] text-rose-700 font-bold">
                            {cluster.daysBetweenRepairAndRecurrence || 18} days post-repair
                          </span>
                        </div>
                        <p className="text-rose-800 text-[11px]">
                          Automated alarm flagged new complaint recurrence within 90-day defect liability period.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Inspections */}
                  {cluster.inspections.map((i) => (
                    <div key={i.id} className="relative">
                      <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-teal-600 border-2 border-white shadow-xs" />
                      <div className="space-y-0.5 bg-teal-50/50 p-2.5 rounded-lg border border-teal-200">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-teal-900 text-xs flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                            Official QC Inspection Certified ({i.id})
                          </span>
                          <span className="text-[10px] text-teal-800 font-mono">
                            {new Date(i.inspectionDate || i.verifiedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-teal-800 text-[11px]">
                          Inspector {i.inspectorName}: Silt level {i.siltLevelCM}cm - {i.approvalStatus}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: ROOT-CAUSE HYPOTHESES */}
          {activeTab === 'root_cause' && (
            <div className="space-y-4">
              {/* AI Badge & Disclaimer Header */}
              <div className="bg-amber-50/80 border border-amber-200 rounded-lg p-3 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <div className="font-bold text-amber-900 text-xs uppercase tracking-wide">
                    {t.aiHypothesisBadge}
                  </div>
                  <p className="text-amber-800 text-[11px] leading-relaxed">
                    {t.aiDisclaimer}
                  </p>
                </div>
              </div>

              {/* Analysis Summary Box */}
              {cluster.aiAnalysis ? (
                <div className="bg-white p-4.5 rounded-xl border border-gray-200 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <div>
                      <span className="text-[10px] text-gray-400 font-mono">
                        Model: {cluster.aiAnalysis.modelUsed} • Analyzed at{' '}
                        {new Date(cluster.aiAnalysis.analyzedAt).toLocaleDateString()}
                      </span>
                      <h3 className="text-sm font-bold text-gray-900 mt-0.5">
                        Engineering Diagnostic Summary
                      </h3>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                        {cluster.aiAnalysis.confidenceScore}% Diagnostic Confidence
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-800 leading-relaxed text-xs">
                    {cluster.aiAnalysis.summary}
                  </p>

                  {/* Individual Hypotheses */}
                  <div className="space-y-3 pt-2">
                    <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider text-[11px]">
                      Mechanisms of Recurrent Failure
                    </h4>
                    {cluster.aiAnalysis.hypotheses.map((hyp) => (
                      <div
                        key={hyp.id}
                        className="p-3.5 bg-gray-50 rounded-lg border border-gray-200 space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-indigo-900 text-xs">
                            {hyp.title}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200">
                            {hyp.engineeringCategory}
                          </span>
                        </div>
                        <p className="text-gray-700 leading-relaxed">
                          {hyp.hypothesis}
                        </p>
                        <div className="text-[11px] text-gray-600 bg-white p-2 rounded border border-gray-200/80">
                          <strong className="text-gray-900">Telemetry Evidence:</strong>{' '}
                          {hyp.supportingEvidence.join(' • ')}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Recommended Inspections Checklist */}
                  <div className="space-y-2 pt-2">
                    <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider text-[11px]">
                      Mandatory Engineer Inspection Checklist
                    </h4>
                    <div className="space-y-2">
                      {cluster.aiAnalysis.recommendedInspections.map((insp) => (
                        <div
                          key={insp.step}
                          className="p-3 bg-white rounded-lg border border-gray-200 flex items-start gap-3"
                        >
                          <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                            {insp.step}
                          </div>
                          <div className="flex-1 space-y-0.5">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-gray-900 text-xs">
                                {insp.inspectionType} &rarr; {insp.targetAsset}
                              </span>
                              <span className="text-[10px] text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 font-semibold">
                                {insp.urgency}
                              </span>
                            </div>
                            <p className="text-gray-600 text-[11px]">{insp.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Permanent Remedy vs Quick Mitigation */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg space-y-1">
                      <span className="text-[10px] font-bold text-emerald-800 uppercase block">
                        Permanent Capital Remedy
                      </span>
                      <p className="text-emerald-950 font-medium">
                        {cluster.aiAnalysis.permanentRemedy}
                      </p>
                    </div>

                    <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg space-y-1">
                      <span className="text-[10px] font-bold text-amber-800 uppercase block">
                        Immediate Interim Mitigation
                      </span>
                      <p className="text-amber-950 font-medium">
                        {cluster.aiAnalysis.temporaryMitigation}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 bg-white rounded-xl border border-gray-200 p-6 space-y-3">
                  <Sparkles className="w-8 h-8 text-indigo-600 mx-auto" />
                  <p className="text-gray-600 font-medium">
                    No automated root-cause analysis has been generated for this cluster yet.
                  </p>
                  <button
                    onClick={handleTriggerGeminiAnalysis}
                    disabled={isAnalyzingGemini}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-xs transition cursor-pointer"
                  >
                    {isAnalyzingGemini ? 'Running Gemini Analysis...' : 'Run Gemini Root-Cause Diagnostics'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CHRONOLOGICAL INCIDENTS */}
          {activeTab === 'complaints' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                <span className="font-bold text-gray-900">
                  Correlated Complaints in Catchment ({complaints.length})
                </span>
                <span className="text-gray-500 text-[11px]">
                  Clustered within ~{cluster.radiusMeters}m radius
                </span>
              </div>

              {complaints.length === 0 ? (
                <p className="text-gray-400 py-6 text-center">Loading incident reports...</p>
              ) : (
                <div className="space-y-3">
                  {complaints.map((item, idx) => (
                    <div
                      key={item.id}
                      className="p-4 bg-white rounded-xl border border-gray-200 shadow-2xs space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[11px] font-bold text-gray-500">
                              #{idx + 1} {item.id}
                            </span>
                            <span className="text-[10px] font-bold uppercase px-1.5 py-0.2 rounded bg-gray-100 text-gray-700">
                              {item.severity}
                            </span>
                          </div>
                          <h4 className="font-bold text-gray-900 text-xs mt-0.5">{item.title}</h4>
                        </div>
                        <span className="text-[11px] text-gray-400 font-mono">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <p className="text-gray-700 italic bg-gray-50 p-2.5 rounded border border-gray-100">
                        "{item.description}"
                      </p>

                      <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1">
                        <span>Reported by: {item.citizenName || 'Citizen'}</span>
                        <span className="capitalize font-semibold text-indigo-600">
                          {item.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: INTERVENTIONS & INSPECTIONS */}
          {activeTab === 'repairs' && (
            <div className="space-y-5">
              {/* Action buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowLogRepairModal(true)}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-xs shadow-xs transition cursor-pointer flex items-center gap-1.5"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Log New Officer Intervention</span>
                </button>

                <button
                  onClick={() => setShowLogInspectionModal(true)}
                  className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold text-xs shadow-xs transition cursor-pointer flex items-center gap-1.5"
                >
                  <ClipboardCheck className="w-3.5 h-3.5" />
                  <span>Record Official Ground Inspection</span>
                </button>
              </div>

              {/* Logged Repairs */}
              <div className="space-y-3">
                <h3 className="font-bold text-gray-900 text-xs uppercase tracking-wider">
                  Logged Physical Interventions ({cluster.repairs.length})
                </h3>
                {cluster.repairs.length === 0 ? (
                  <p className="text-gray-400 bg-white p-4 rounded-xl border border-gray-200 text-center">
                    No physical repairs recorded for this hotspot yet.
                  </p>
                ) : (
                  cluster.repairs.map((r, i) => (
                    <div key={r.id || i} className="p-4 bg-white rounded-xl border border-gray-200 shadow-2xs space-y-2">
                      <div className="flex items-center justify-between font-bold text-gray-900">
                        <span>{r.workType}</span>
                        <span className="text-gray-400 font-mono text-[11px]">
                          {new Date(r.interventionDate || r.workCompletedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-700">{r.description}</p>
                      <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1 border-t border-gray-100">
                        <span>Officer: {r.officerName}</span>
                        <span>Contractor: {r.contractorAgency || 'GCC In-House'}</span>
                        <span className="font-mono font-bold text-gray-800">
                          ₹{(r.estimatedCostINR || 0).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Recorded Inspections */}
              <div className="space-y-3 pt-2">
                <h3 className="font-bold text-gray-900 text-xs uppercase tracking-wider">
                  Recorded Quality Control Inspections ({cluster.inspections.length})
                </h3>
                {cluster.inspections.length === 0 ? (
                  <p className="text-gray-400 bg-white p-4 rounded-xl border border-gray-200 text-center">
                    No official inspections recorded. Awaiting physical certification.
                  </p>
                ) : (
                  cluster.inspections.map((insp, i) => (
                    <div key={insp.id || i} className="p-4 bg-teal-50/40 rounded-xl border border-teal-200 shadow-2xs space-y-2">
                      <div className="flex items-center justify-between font-bold text-gray-900">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-teal-600" />
                          <span>Inspector: {insp.inspectorName} ({insp.inspectorDesignation})</span>
                        </span>
                        <span className="text-teal-800 font-mono text-[11px]">
                          {new Date(insp.inspectionDate || insp.verifiedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-700">{insp.inspectionFindings}</p>
                      <div className="flex items-center justify-between text-[11px] text-teal-900 font-semibold pt-1 border-t border-teal-200/60">
                        <span>Residual Silt: {insp.siltLevelCM} cm</span>
                        <span className="capitalize font-bold">
                          {insp.approvalStatus.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: PRIORITY SCORE MATH */}
          {activeTab === 'priority' && (
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    Transparent Priority Formula Breakdown
                  </h3>
                  <p className="text-gray-500 text-xs mt-0.5">
                    Objective mathematical ranking eliminating political bias in municipal prioritization
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-extrabold text-indigo-700 font-mono tabular-nums">
                    {cluster.priorityScore}/100
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <span className="font-semibold text-gray-900 block">Recurrence Weight</span>
                    <span className="text-[11px] text-gray-500">10 points per repeat complaint (capped at 50)</span>
                  </div>
                  <span className="font-mono font-bold text-indigo-700">
                    +{cluster.priorityBreakdown?.recurrencePoints ?? 30} pts
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <span className="font-semibold text-gray-900 block">Severity Severity Weight</span>
                    <span className="text-[11px] text-gray-500">Critical (30), High (25), Medium (20)</span>
                  </div>
                  <span className="font-mono font-bold text-indigo-700">
                    +{cluster.priorityBreakdown?.severityPoints ?? 25} pts
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <span className="font-semibold text-gray-900 block">Active Duration Weight</span>
                    <span className="text-[11px] text-gray-500">Days unresolved multiplier (capped at 20)</span>
                  </div>
                  <span className="font-mono font-bold text-indigo-700">
                    +{cluster.priorityBreakdown?.durationPoints ?? 15} pts
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-rose-50/70 border border-rose-200 rounded-lg">
                  <div>
                    <span className="font-semibold text-rose-950 block">Defect Relapse Penalty</span>
                    <span className="text-[11px] text-rose-800">Repeated failure after past certified repair</span>
                  </div>
                  <span className="font-mono font-bold text-rose-700">
                    +{cluster.priorityBreakdown?.vulnerabilityModifier ?? 12} pts
                  </span>
                </div>
              </div>

              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-indigo-900 text-xs">
                <strong>System Rationale:</strong> {cluster.priorityBreakdown?.rationale}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-white flex items-center justify-between">
          <div className="text-gray-500 text-xs">
            GCC Command ID: <span className="font-mono text-gray-700">{cluster.id}</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-semibold text-xs transition cursor-pointer"
          >
            Close Dossier
          </button>
        </div>
      </div>

      {/* QUICK LOG REPAIR SUB-MODAL */}
      {showLogRepairModal && (
        <div className="fixed inset-0 z-60 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-gray-900">Log Physical Intervention Work</h3>
            <form onSubmit={handleSaveRepair} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Work Description</label>
                <input
                  type="text"
                  value={repairWorkType}
                  onChange={(e) => setRepairWorkType(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded p-2 text-gray-900"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Contractor Agency</label>
                <input
                  type="text"
                  value={repairContractor}
                  onChange={(e) => setRepairContractor(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded p-2 text-gray-900"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Notes</label>
                <textarea
                  rows={2}
                  value={repairDesc}
                  onChange={(e) => setRepairDesc(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded p-2 text-gray-900"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLogRepairModal(false)}
                  className="px-3 py-1.5 rounded border border-gray-200 text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded bg-indigo-600 text-white font-semibold"
                >
                  Save Intervention
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK LOG INSPECTION SUB-MODAL */}
      {showLogInspectionModal && (
        <div className="fixed inset-0 z-60 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-gray-900">Record Field Inspection & Sign-off</h3>
            <form onSubmit={handleSaveInspection} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Inspector Name</label>
                <input
                  type="text"
                  value={inspectOfficer}
                  onChange={(e) => setInspectOfficer(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded p-2 text-gray-900"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Silt Level (CM)</label>
                <input
                  type="number"
                  value={inspectSilt}
                  onChange={(e) => setInspectSilt(Number(e.target.value))}
                  className="w-full bg-gray-50 border border-gray-200 rounded p-2 text-gray-900"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Approval Status</label>
                <select
                  value={inspectApproval}
                  onChange={(e) => setInspectApproval(e.target.value as any)}
                  className="w-full bg-gray-50 border border-gray-200 rounded p-2 text-gray-900"
                >
                  <option value="approved_verified">Approved & Verified</option>
                  <option value="rejected_rework_needed">Rejected - Rework Needed</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLogInspectionModal(false)}
                  className="px-3 py-1.5 rounded border border-gray-200 text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded bg-teal-600 text-white font-semibold"
                >
                  Certify Inspection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
