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
  Loader2
} from 'lucide-react';

interface Props {
  clusters: RecurrenceCluster[];
  onRefreshClusters: () => void;
  currentLang: Language;
}

export const RepairHubView: React.FC<Props> = ({
  clusters,
  onRefreshClusters,
  currentLang,
}) => {
  const t = translations[currentLang];
  const [selectedClusterId, setSelectedClusterId] = useState<string>(clusters[0]?.id || '');
  const [activeFormTab, setActiveFormTab] = useState<'repair' | 'inspection'>('repair');

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

  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const selectedCluster = clusters.find((c) => c.id === selectedClusterId);

  const handleLogRepair = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClusterId) return;

    setIsSubmittingRepair(true);
    setMessage(null);

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
        setMessage({
          text: 'Intervention successfully logged. Asset is now set to "Work Done - Pending Inspection". Field inspection required for verification.',
          type: 'success',
        });
        onRefreshClusters();
      } else {
        setMessage({ text: 'Failed to record intervention.', type: 'error' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ text: 'Error connecting to server.', type: 'error' });
    } finally {
      setIsSubmittingRepair(false);
    }
  };

  const handleLogInspection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClusterId) return;

    setIsSubmittingInspection(true);
    setMessage(null);

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
        if (approvalStatus === 'approved_verified') {
          setMessage({
            text: 'Official Inspection Approved! Cluster is now officially Verified and Resolved in the GCC municipal ledger.',
            type: 'success',
          });
        } else {
          setMessage({
            text: 'Inspection logged: Rework required. Cluster returned to In Remediation status.',
            type: 'error',
          });
        }
        onRefreshClusters();
      } else {
        setMessage({ text: 'Failed to record field inspection.', type: 'error' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ text: 'Error connecting to server.', type: 'error' });
    } finally {
      setIsSubmittingInspection(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-800/60 p-5 rounded-2xl border border-slate-700/60 space-y-2">
        <h1 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
          <Wrench className="w-5 h-5 text-indigo-400" />
          <span>{currentLang === 'en' ? 'Municipal Officer Repair & Inspection Hub' : 'அதிகாரி சீரமைப்பு மற்றும் ஆய்வு மையம்'}</span>
        </h1>
        <p className="text-xs text-slate-300">
          {currentLang === 'en'
            ? 'Two-step verified resolution protocol: Ward engineers first log physical interventions, then certified inspection officers record ground measurements. No repair is verified without a recorded inspection.'
            : 'இரு-படி சரிபார்ப்பு முறை: பொறியாளர்கள் பணிகளை பதிவு செய்த பிறகு, தகுதிவாய்ந்த கள அதிகாரி ஆய்வு செய்த பின்னரே தீர்க்கப்பட்டதாக அறிவிக்கப்படும்.'}
        </p>
      </div>

      {/* Target Cluster Selection Bar */}
      <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-400" />
          <span>Select Recurrence Incident / Hotspot:</span>
        </label>
        <select
          value={selectedClusterId}
          onChange={(e) => setSelectedClusterId(e.target.value)}
          className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 max-w-md w-full"
        >
          {clusters.map((c) => (
            <option key={c.id} value={c.id}>
              [{c.id}] {c.area} ({c.recurrenceCount} complaints) - Status: {c.status}
            </option>
          ))}
        </select>
      </div>

      {/* Cluster Status Summary */}
      {selectedCluster && (
        <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm">
                {selectedCluster.title}
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
                {selectedCluster.zone} • Ward {selectedCluster.ward}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Current Status:{' '}
              <span className="font-semibold text-indigo-300 capitalize">
                {selectedCluster.status.replace(/_/g, ' ')}
              </span>{' '}
              • {selectedCluster.repairs.length} prior repair(s) •{' '}
              {selectedCluster.inspections.length} recorded inspection(s)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveFormTab('repair')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                activeFormTab === 'repair'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>1. Log Intervention Work</span>
            </button>
            <button
              onClick={() => setActiveFormTab('inspection')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                activeFormTab === 'inspection'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <ClipboardCheck className="w-3.5 h-3.5" />
              <span>2. Record Field Inspection</span>
            </button>
          </div>
        </div>
      )}

      {/* Status Message */}
      {message && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
              : 'bg-rose-950/40 border-rose-500/50 text-rose-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Form Panels */}
      {activeFormTab === 'repair' ? (
        /* STEP 1: LOG REPAIR INTERVENTION */
        <form onSubmit={handleLogRepair} className="bg-slate-800/40 p-5 rounded-2xl border border-slate-700/60 space-y-4">
          <div className="flex items-center gap-2 text-indigo-300 font-semibold text-sm border-b border-slate-700/60 pb-2">
            <Wrench className="w-4 h-4 text-indigo-400" />
            <span>Step 1: Record Physical Intervention & Remedial Work</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Supervising Officer Name</label>
              <input
                type="text"
                value={officerName}
                onChange={(e) => setOfficerName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Officer Designation</label>
              <input
                type="text"
                value={officerDesignation}
                onChange={(e) => setOfficerDesignation(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Contractor / Execution Agency</label>
              <input
                type="text"
                value={contractorAgency}
                onChange={(e) => setContractorAgency(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Estimated Cost (INR ₹)</label>
              <input
                type="number"
                value={estimatedCostINR}
                onChange={(e) => setEstimatedCostINR(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Intervention Work Type</label>
            <input
              type="text"
              value={workType}
              onChange={(e) => setWorkType(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
              placeholder="e.g. Silt Clearing, Culvert Re-alignment, Pump Deployment"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Detailed Work Description</label>
            <textarea
              rows={3}
              value={repairDescription}
              onChange={(e) => setRepairDescription(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
            />
          </div>

          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              <strong>Crucial Protocol:</strong> Submitting this work order will advance the asset to <em>"Work Done - Pending Inspection"</em>. The repair will NOT be counted as verified until an authorized inspection officer logs a physical site verification in Step 2.
            </span>
          </div>

          <button
            type="submit"
            disabled={isSubmittingRepair}
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-2"
          >
            {isSubmittingRepair ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wrench className="w-4 h-4" />}
            <span>Record Municipal Intervention</span>
          </button>
        </form>
      ) : (
        /* STEP 2: RECORD FIELD INSPECTION */
        <form onSubmit={handleLogInspection} className="bg-slate-800/40 p-5 rounded-2xl border border-slate-700/60 space-y-4">
          <div className="flex items-center gap-2 text-emerald-300 font-semibold text-sm border-b border-slate-700/60 pb-2">
            <ClipboardCheck className="w-4 h-4 text-emerald-400" />
            <span>Step 2: Mandatory Field Officer Inspection & Verification</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Inspector Name</label>
              <input
                type="text"
                value={inspectorName}
                onChange={(e) => setInspectorName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Inspector Official Designation</label>
              <input
                type="text"
                value={inspectorDesignation}
                onChange={(e) => setInspectorDesignation(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Residual Silt Depth (cm)</label>
              <input
                type="number"
                value={siltLevelCM}
                onChange={(e) => setSiltLevelCM(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
              />
              <span className="text-[10px] text-slate-400">Must be &le; 10cm for approval pass</span>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Inspection Approval Decision</label>
              <select
                value={approvalStatus}
                onChange={(e) => setApprovalStatus(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value="approved_verified">Approved & Verified (Mark Resolved)</option>
                <option value="rejected_rework_needed">Rejected (Rework Required)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Field Inspection Observations</label>
            <textarea
              rows={3}
              value={inspectionFindings}
              onChange={(e) => setInspectionFindings(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-indigo-400" />
              <span>After-Repair Verification Photo Evidence</span>
            </label>
            <input
              type="text"
              value={afterPhotoUrl}
              onChange={(e) => setAfterPhotoUrl(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmittingInspection}
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-2"
          >
            {isSubmittingInspection ? <Loader2 className="w-4 h-4 animate-spin" /> : <ClipboardCheck className="w-4 h-4" />}
            <span>Submit Official Field Inspection Certification</span>
          </button>
        </form>
      )}

      {/* History of Past Repairs and Inspections for this Cluster */}
      {selectedCluster && (
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-3">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Intervention & Inspection Audit Trail: {selectedCluster.area}
          </h3>

          <div className="space-y-2">
            {selectedCluster.repairs.length === 0 && (
              <p className="text-xs text-slate-500 italic">No interventions logged yet for this cluster.</p>
            )}

            {selectedCluster.repairs.map((r) => (
              <div key={r.id} className="p-3 rounded-lg bg-slate-800/70 border border-slate-700/60 text-xs space-y-1">
                <div className="flex items-center justify-between text-indigo-300 font-semibold">
                  <span>Work Order #{r.id}: {r.workType}</span>
                  <span className="text-slate-400 text-[11px]">{new Date(r.workCompletedAt).toLocaleDateString()}</span>
                </div>
                <p className="text-slate-300">{r.description}</p>
                <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                  <span>Officer: {r.officerName} ({r.officerDesignation})</span>
                  <span>•</span>
                  <span>Cost: ₹{r.estimatedCostINR?.toLocaleString()}</span>
                </div>
              </div>
            ))}

            {selectedCluster.inspections.map((insp) => (
              <div key={insp.id} className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/40 text-xs space-y-1">
                <div className="flex items-center justify-between text-emerald-400 font-semibold">
                  <span>Inspection #{insp.id} - {insp.approvalStatus === 'approved_verified' ? 'APPROVED & VERIFIED' : 'REWORK NEEDED'}</span>
                  <span className="text-slate-400 text-[11px]">{new Date(insp.verifiedAt).toLocaleDateString()}</span>
                </div>
                <p className="text-slate-200">{insp.inspectionFindings}</p>
                <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                  <span>Inspector: {insp.inspectorName} ({insp.inspectorDesignation})</span>
                  <span>•</span>
                  <span>Residual Silt: {insp.siltLevelCM} cm</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
