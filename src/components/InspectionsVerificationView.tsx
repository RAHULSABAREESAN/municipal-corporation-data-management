import React, { useState } from 'react';
import { RecurrenceCluster, RepairRecord, InspectionRecord } from '../types';
import { Language, translations } from '../i18n';
import {
  Wrench,
  CheckCircle2,
  AlertTriangle,
  ClipboardCheck,
  User,
  Building,
  Camera,
  Layers,
  Clock,
  ShieldCheck,
  XCircle,
  Loader2,
  MapPin,
  Calendar,
  ShieldAlert,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface Props {
  clusters: RecurrenceCluster[];
  onRefreshClusters: () => void;
  onSelectCluster: (cluster: RecurrenceCluster) => void;
  currentLang: Language;
}

export const InspectionsVerificationView: React.FC<Props> = ({
  clusters,
  onRefreshClusters,
  onSelectCluster,
  currentLang,
}) => {
  const t = translations[currentLang];
  const [selectedClusterId, setSelectedClusterId] = useState<string>(clusters[0]?.id || '');
  const [activeFormTab, setActiveFormTab] = useState<'inspection' | 'repair'>('inspection');

  // Repair Form State
  const [officerName, setOfficerName] = useState('Er. S. Rajendran');
  const [officerDesignation, setOfficerDesignation] = useState('Assistant Executive Engineer (SWD), Zone 13');
  const [contractorAgency, setContractorAgency] = useState('Metro Rapid Desilting & Civil Infra Ltd');
  const [workType, setWorkType] = useState('Stormwater Box Culvert Desilting & Invert Restoration');
  const [repairDescription, setRepairDescription] = useState('Excavated and transported 12 cubic meters of silt from culvert barrel. Installed 50mm heavy trash grate at the junction.');
  const [estimatedCostINR, setEstimatedCostINR] = useState(145000);
  const [isSubmittingRepair, setIsSubmittingRepair] = useState(false);

  // Inspection Form State
  const [inspectorName, setInspectorName] = useState('Er. M. Geetha');
  const [inspectorDesignation, setInspectorDesignation] = useState('Executive Engineer (SWD Quality Control), GCC');
  const [inspectionFindings, setInspectionFindings] = useState('Physical measurement verified 95% barrel clearance. Full gravity water discharge observed. Flap gate checked.');
  const [waterFlowClearanceObserved, setWaterFlowClearanceObserved] = useState(true);
  const [siltLevelCM, setSiltLevelCM] = useState(4);
  const [approvalStatus, setApprovalStatus] = useState<'approved_verified' | 'rejected_rework_needed'>('approved_verified');
  const [afterPhotoUrl, setAfterPhotoUrl] = useState('https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=800&auto=format&fit=crop&q=80');
  const [isSubmittingInspection, setIsSubmittingInspection] = useState(false);

  const [feedback, setFeedback] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const selectedCluster = clusters.find((c) => c.id === selectedClusterId);

  // Clusters awaiting verification
  const awaitingInspection = clusters.filter(
    (c) => c.status === 'work_completed_pending_inspection' || (c.repairs.length > 0 && c.inspections.length === 0)
  );

  const handleLogRepair = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClusterId) return;

    setIsSubmittingRepair(true);
    setFeedback(null);
    try {
      const res = await fetch(`/api/clusters/${selectedClusterId}/repair`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          officerName,
          officerDesignation,
          contractorAgency,
          workType,
          description: repairDescription,
          estimatedCostINR,
        }),
      });

      if (res.ok) {
        setFeedback({
          text: 'Intervention successfully logged. Incident status moved to "Work Completed - Pending Inspection".',
          type: 'success',
        });
        onRefreshClusters();
      } else {
        const errData = await res.json();
        setFeedback({ text: errData.error || 'Failed to record repair', type: 'error' });
      }
    } catch (err) {
      setFeedback({ text: 'Network error submitting repair', type: 'error' });
    } finally {
      setIsSubmittingRepair(false);
    }
  };

  const handleLogInspection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClusterId) return;

    setIsSubmittingInspection(true);
    setFeedback(null);
    try {
      const res = await fetch(`/api/clusters/${selectedClusterId}/inspection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inspectorName,
          inspectorDesignation,
          inspectionFindings,
          waterFlowClearanceObserved,
          siltLevelCM,
          approvalStatus,
          afterPhotoUrl,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setFeedback({
          text: `Official inspection recorded! Cluster status is now: ${data.cluster.status.toUpperCase().replace(/_/g, ' ')}.`,
          type: 'success',
        });
        onRefreshClusters();
      } else {
        const errData = await res.json();
        setFeedback({ text: errData.error || 'Failed to record inspection', type: 'error' });
      }
    } catch (err) {
      setFeedback({ text: 'Network error recording inspection', type: 'error' });
    } finally {
      setIsSubmittingInspection(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <ClipboardCheck className="w-6 h-6 text-indigo-600" />
              <span>Inspections & Verification Hub</span>
            </h1>
            <span className="text-xs bg-teal-50 text-teal-700 font-bold px-2 py-0.5 rounded border border-teal-200 uppercase">
              Two-Gate Protocol
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Strict GCC quality assurance: No municipal repair is marked resolved without physical measurement and engineer certification.
          </p>
        </div>
      </div>

      {/* Policy Callout Banner */}
      <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs">
          <h4 className="font-bold text-amber-900 uppercase tracking-wide">
            Greater Chennai Corporation Directive ISWD-2026
          </h4>
          <p className="text-amber-800 mt-0.5 leading-relaxed">
            {t.cannotVerifyWithoutInspection} Both barrel silt depth measurements (&le; 10cm) and free hydraulic gravity flow must be verified under dry and surge conditions before public closure.
          </p>
        </div>
      </div>

      {/* Target Cluster Selector Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-700">
          <Layers className="w-4 h-4 text-indigo-600" />
          <span>Active Target Hotspot:</span>
        </div>
        <select
          value={selectedClusterId}
          onChange={(e) => setSelectedClusterId(e.target.value)}
          className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 max-w-xl w-full font-medium"
        >
          {clusters.map((c) => (
            <option key={c.id} value={c.id}>
              [{c.id}] {c.area} ({c.zone}, Ward {c.ward}) — {c.status.toUpperCase().replace(/_/g, ' ')}
            </option>
          ))}
        </select>
      </div>

      {/* Selected Cluster Info Card */}
      {selectedCluster && (
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-gray-500">{selectedCluster.id}</span>
                <span className="text-xs font-bold text-gray-900">{selectedCluster.title}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {selectedCluster.zone} • Ward {selectedCluster.ward}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Status:{' '}
                <span className="font-bold text-gray-800 capitalize">
                  {selectedCluster.status.replace(/_/g, ' ')}
                </span>{' '}
                • {selectedCluster.repairs.length} logged repair(s) •{' '}
                {selectedCluster.inspections.length} recorded inspection(s)
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveFormTab('inspection')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  activeFormTab === 'inspection'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <ClipboardCheck className="w-3.5 h-3.5" />
                <span>1. Record Field Inspection</span>
              </button>
              <button
                onClick={() => setActiveFormTab('repair')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  activeFormTab === 'repair'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>2. Log Officer Intervention</span>
              </button>
            </div>
          </div>

          {/* Feedback banner */}
          {feedback && (
            <div
              className={`p-3 rounded-lg text-xs font-medium flex items-center gap-2 ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{feedback.text}</span>
            </div>
          )}

          {/* Form Content */}
          {activeFormTab === 'inspection' ? (
            <form onSubmit={handleLogInspection} className="space-y-4 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">
                    Quality Control Inspector Name
                  </label>
                  <input
                    type="text"
                    value={inspectorName}
                    onChange={(e) => setInspectorName(e.target.value)}
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">
                    Inspector Designation & Authority
                  </label>
                  <input
                    type="text"
                    value={inspectorDesignation}
                    onChange={(e) => setInspectorDesignation(e.target.value)}
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">
                    Residual Silt Level (Centimeters)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={siltLevelCM}
                    onChange={(e) => setSiltLevelCM(Number(e.target.value))}
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  />
                  <span className="text-[10px] text-gray-500 mt-0.5 block">
                    Must be &le; 10cm for certified approval under GCC norms
                  </span>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">
                    Verification Outcome
                  </label>
                  <select
                    value={approvalStatus}
                    onChange={(e) => setApprovalStatus(e.target.value as any)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  >
                    <option value="approved_verified">
                      ✅ Approved & Verified (Mark Cluster as Verified Resolved)
                    </option>
                    <option value="rejected_rework_needed">
                      ❌ Rejected (Rework Needed by Contractor)
                    </option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-gray-700 font-semibold mb-1">
                    Detailed Field Findings & Hydraulic Verification Notes
                  </label>
                  <textarea
                    rows={3}
                    value={inspectionFindings}
                    onChange={(e) => setInspectionFindings(e.target.value)}
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={waterFlowClearanceObserved}
                      onChange={(e) => setWaterFlowClearanceObserved(e.target.checked)}
                      className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
                    />
                    <span className="font-medium text-gray-800">
                      I certify that unobstructed gravity flow was physically observed through the culvert/drain barrel.
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={isSubmittingInspection}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold text-xs shadow-xs transition cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmittingInspection ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  <span>Sign & Certify Inspection</span>
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleLogRepair} className="space-y-4 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">
                    Assigned Ward Officer / Engineer Name
                  </label>
                  <input
                    type="text"
                    value={officerName}
                    onChange={(e) => setOfficerName(e.target.value)}
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">
                    Officer Designation & Zone
                  </label>
                  <input
                    type="text"
                    value={officerDesignation}
                    onChange={(e) => setOfficerDesignation(e.target.value)}
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">
                    Contractor / Execution Agency
                  </label>
                  <input
                    type="text"
                    value={contractorAgency}
                    onChange={(e) => setContractorAgency(e.target.value)}
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">
                    Estimated Cost (INR ₹)
                  </label>
                  <input
                    type="number"
                    value={estimatedCostINR}
                    onChange={(e) => setEstimatedCostINR(Number(e.target.value))}
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-gray-700 font-semibold mb-1">
                    Civil Intervention Type
                  </label>
                  <input
                    type="text"
                    value={workType}
                    onChange={(e) => setWorkType(e.target.value)}
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-gray-700 font-semibold mb-1">
                    Description of Completed Works
                  </label>
                  <textarea
                    rows={3}
                    value={repairDescription}
                    onChange={(e) => setRepairDescription(e.target.value)}
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={isSubmittingRepair}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-xs shadow-xs transition cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmittingRepair ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Wrench className="w-4 h-4" />
                  )}
                  <span>Record Officer Intervention</span>
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Historical Audit of Prior Repairs & Inspections */}
      {selectedCluster && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Prior Repairs Log */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs space-y-3">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Wrench className="w-4 h-4 text-indigo-600" />
              <span>Prior Interventions Log ({selectedCluster.repairs.length})</span>
            </h3>
            {selectedCluster.repairs.length === 0 ? (
              <p className="text-xs text-gray-400 py-3">No interventions recorded for this hotspot yet.</p>
            ) : (
              <div className="space-y-3">
                {selectedCluster.repairs.map((r, i) => (
                  <div key={r.id || i} className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold text-gray-900">
                      <span>{r.workType}</span>
                      <span className="text-[10px] text-gray-500 font-mono">{new Date(r.interventionDate || r.workCompletedAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-gray-600 leading-relaxed">{r.description}</p>
                    <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1 border-t border-gray-200/60">
                      <span>Officer: {r.officerName}</span>
                      <span>Contractor: {r.contractorAgency || 'GCC Direct'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recorded Inspections Log */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs space-y-3">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4 text-teal-600" />
              <span>Recorded Field Inspections ({selectedCluster.inspections.length})</span>
            </h3>
            {selectedCluster.inspections.length === 0 ? (
              <p className="text-xs text-gray-400 py-3">No physical inspections recorded yet. Awaiting QC sign-off.</p>
            ) : (
              <div className="space-y-3">
                {selectedCluster.inspections.map((insp, i) => (
                  <div key={insp.id || i} className="p-3 bg-teal-50/40 rounded-lg border border-teal-200 text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold text-gray-900">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                        <span>Inspector: {insp.inspectorName}</span>
                      </span>
                      <span className="text-[10px] text-teal-800 font-mono">{new Date(insp.inspectionDate || insp.verifiedAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{insp.inspectionFindings}</p>
                    <div className="flex items-center justify-between text-[11px] text-teal-900 pt-1 border-t border-teal-200/60 font-semibold">
                      <span>Silt Depth: {insp.siltLevelCM} cm</span>
                      <span className="capitalize">{insp.approvalStatus.replace(/_/g, ' ')}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
