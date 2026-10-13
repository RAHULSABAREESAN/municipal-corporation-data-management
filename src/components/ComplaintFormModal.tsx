import React, { useState } from 'react';
import {
  X,
  FileText,
  Sparkles,
  MapPin,
  AlertCircle,
  CheckCircle2,
  Send,
  Loader2,
  Navigation,
  Info
} from 'lucide-react';
import { ComplaintCategory, ComplaintSeverity } from '../types';
import { Language, translations } from '../i18n';
import { CHENNAI_ZONES } from '../data/mockData';
import { saveComplaintToFirestore } from '../firebase';
import { PhotoCapture, PhotoEvidenceCapture } from './PhotoEvidenceCapture';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess: () => void;
  currentLang: Language;
}

export const ComplaintFormModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSubmitSuccess,
  currentLang,
}) => {
  const t = translations[currentLang];

  const [category, setCategory] = useState<ComplaintCategory>('Waterlogging & Stormwater');
  const [description, setDescription] = useState('');
  const [englishTranslation, setEnglishTranslation] = useState('');
  const [title, setTitle] = useState('');
  const [area, setArea] = useState('Velachery 100 Feet Road');
  const [zone, setZone] = useState('Zone 13 - Adyar');
  const [ward, setWard] = useState<number>(178);
  const [landmark, setLandmark] = useState('Opposite Phoenix Marketcity Mall');
  const [latitude, setLatitude] = useState<number>(12.9915);
  const [longitude, setLongitude] = useState<number>(80.2185);
  const [severity, setSeverity] = useState<ComplaintSeverity>('high');
  const [citizenName, setCitizenName] = useState('Deepak R');
  const [citizenPhone, setCitizenPhone] = useState('+91 98400 12345');
  const [photoCapture, setPhotoCapture] = useState<PhotoCapture | null>(null);

  const [isTranslating, setIsTranslating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState('');
  const [submissionResult, setSubmissionResult] = useState<{
    success: boolean;
    isRecurrent?: boolean;
    clusterId?: string;
    isPostRepairRelapse?: boolean;
  } | null>(null);

  if (!isOpen) return null;

  // Quick preset locations in Chennai
  const presets = [
    {
      name: 'Velachery 100ft Rd',
      zone: 'Zone 13 - Adyar',
      ward: 178,
      lat: 12.9915,
      lng: 80.2185,
      landmark: 'Near Phoenix Marketcity',
      sampleTanglish: 'Velachery 100 feet road la heavy water stagnation. Every mild shower makes water enter showrooms and service road.',
    },
    {
      name: 'T. Nagar Bazullah Rd',
      zone: 'Zone 10 - Kodambakkam',
      ward: 136,
      lat: 13.0418,
      lng: 80.2335,
      landmark: 'Hindi Prachar Sabha corner',
      sampleTanglish: 'Bazullah road la drain overflow aagi knee deep water nikkuthu. Vehicle totally stuck.',
    },
    {
      name: 'Madipakkam Ram Nagar',
      zone: 'Zone 14 - Perungudi',
      ward: 188,
      lat: 12.9642,
      lng: 80.2014,
      landmark: 'Ram Nagar South 3rd Cross',
      sampleTanglish: 'Madipakkam Ram Nagar la lake overflow aagi veetukulla thanni vandhuduchu 2 days ah.',
    },
    {
      name: 'Vyasarpadi Subway',
      zone: 'Zone 4 - Tondiarpet',
      ward: 35,
      lat: 13.1118,
      lng: 80.2642,
      landmark: 'Ganesapuram Railway Underpass',
      sampleTanglish: 'Ganesapuram subway keezha 5 feet thanni nikkuthu. Pump stopped working.',
    },
  ];

  const handleApplyPreset = (p: typeof presets[0]) => {
    setArea(p.name);
    setZone(p.zone);
    setWard(p.ward);
    setLatitude(p.lat);
    setLongitude(p.lng);
    setLandmark(p.landmark);
    setDescription(p.sampleTanglish);
  };

  const handleTranslateTanglish = async () => {
    if (!description.trim()) return;
    setIsTranslating(true);
    try {
      const res = await fetch('/api/translate-tanglish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: description }),
      });
      const data = await res.json();
      if (data.englishTranslation) {
        setEnglishTranslation(data.englishTranslation);
      }
      if (data.summaryTitle && !title) {
        setTitle(data.summaryTitle);
      }
      if (data.category) {
        setCategory(data.category as ComplaintCategory);
      }
      if (data.severity) {
        setSeverity(data.severity as ComplaintSeverity);
      }
    } catch (err) {
      console.error('Translation error:', err);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !area) return;
    if (!photoCapture) {
      setSubmissionError('Capture a live photo with GPS before submitting this complaint.');
      return;
    }

    setIsSubmitting(true);
    setSubmissionError('');
    try {
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          title: title || `${area} - ${category}`,
          description,
          englishTranslation: englishTranslation || description,
          originalLanguage: description.match(/[\u0B80-\u0BFF]/) ? 'ta' : 'tanglish',
          area,
          zone,
          ward,
          landmark,
          latitude,
          longitude,
          severity,
          citizenName,
          citizenPhone,
          photoDataUrl: photoCapture.dataUrl,
          photoLatitude: photoCapture.latitude,
          photoLongitude: photoCapture.longitude,
          photoCapturedAt: photoCapture.capturedAt,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Could not submit the complaint.');
      }
      if (data.complaint) {
        saveComplaintToFirestore(data.complaint);
      }
      setSubmissionResult({
        success: true,
        isRecurrent: data.isRecurrent,
        clusterId: data.cluster?.id,
        isPostRepairRelapse: data.isPostRepairRelapse,
      });
      setTimeout(() => {
        onSubmitSuccess();
        onClose();
      }, 2200);
    } catch (err) {
      console.error('Submit complaint error:', err);
      setSubmissionError(err instanceof Error ? err.message : 'Could not submit the complaint.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-xl border border-gray-200 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-200 bg-gray-50/70 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded border border-indigo-200 uppercase">
                Citizen Triage
              </span>
              <span className="text-xs text-gray-500 font-medium">15 GCC Zones</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight mt-1">
              {currentLang === 'en' ? 'Report Municipal Complaint' : 'மாநகராட்சி புகார் பதிவு'}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              CivicLoop automatically correlates your report with nearby historical incidents to identify systemic recurrence.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 text-xs">
          {/* Presets */}
          <div className="bg-indigo-50/60 p-3 rounded-lg border border-indigo-100 space-y-1.5">
            <span className="font-bold text-indigo-900 text-[11px] flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              Quick Chennai Test Presets (Click to autofill):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {presets.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => handleApplyPreset(p)}
                  className="px-2.5 py-1 bg-white hover:bg-indigo-50 text-indigo-700 border border-indigo-200 rounded text-[11px] font-medium transition cursor-pointer"
                >
                  {p.name} ({p.zone.split('-')[0].trim()})
                </button>
              ))}
            </div>
          </div>

          {/* Submission Result Feedback */}
          {submissionResult && (
            <div
              className={`p-4 rounded-xl border text-xs space-y-1.5 ${
                submissionResult.isPostRepairRelapse
                  ? 'bg-rose-50 border-rose-200 text-rose-900'
                  : submissionResult.isRecurrent
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-900'
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Complaint Successfully Logged!</span>
              </div>
              {submissionResult.isPostRepairRelapse && (
                <p className="font-semibold text-rose-700">
                  ⚠️ ALARM: Correlated to completed repair at cluster {submissionResult.clusterId}. Escalated as Contractor Warranty Relapse!
                </p>
              )}
              {submissionResult.isRecurrent && !submissionResult.isPostRepairRelapse && (
                <p className="font-medium text-amber-800">
                  Correlated with existing cluster {submissionResult.clusterId}. Recurrence priority score re-computed.
                </p>
              )}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Description & Tanglish AI Translation */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-gray-700 font-semibold">
                  Complaint Description (Supports English, Tamil, or Tanglish)
                </label>
                <button
                  type="button"
                  onClick={handleTranslateTanglish}
                  disabled={isTranslating || !description.trim()}
                  className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer disabled:opacity-40"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isTranslating ? 'Translating with Gemini...' : 'Translate & Autofill with AI'}</span>
                </button>
              </div>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Velachery 100ft road la heavy water stagnation, drain block aagirukku 3 days ah..."
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                required
              />
              {englishTranslation && (
                <div className="mt-1.5 p-2 bg-indigo-50 rounded border border-indigo-100 text-[11px] text-indigo-900">
                  <strong>English Translation:</strong> {englishTranslation}
                </div>
              )}
            </div>

            {/* Grid fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Infrastructure Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ComplaintCategory)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                >
                  <option value="Waterlogging & Stormwater">Waterlogging & Stormwater</option>
                  <option value="Potholes & Road Damage">Potholes & Road Damage</option>
                  <option value="Sewage Overflow">Sewage Overflow</option>
                  <option value="Solid Waste / Canal Choking">Solid Waste / Canal Choking</option>
                  <option value="Streetlight Outage">Streetlight Outage</option>
                  <option value="Fallen Tree / Hazard">Fallen Tree / Hazard</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Severity Level</label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as ComplaintSeverity)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                >
                  <option value="critical">Critical (Immediate Hazard)</option>
                  <option value="high">High (Major Inundation)</option>
                  <option value="medium">Medium (Partial Inconvenience)</option>
                  <option value="low">Low (Minor Puddle)</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Area / Street Name</label>
                <input
                  type="text"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">GCC Zone Division</label>
                <select
                  value={zone}
                  onChange={(e) => setZone(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                >
                  {CHENNAI_ZONES.map((z) => (
                    <option key={z.id} value={z.name}>
                      {z.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Ward Number</label>
                <input
                  type="number"
                  value={ward}
                  onChange={(e) => setWard(Number(e.target.value))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Landmark</label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Citizen Name</label>
                <input
                  type="text"
                  value={citizenName}
                  onChange={(e) => setCitizenName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Citizen Contact Number</label>
                <input
                  type="text"
                  value={citizenPhone}
                  onChange={(e) => setCitizenPhone(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>
            </div>

            <PhotoEvidenceCapture
              value={photoCapture}
              onChange={(capture) => {
                setPhotoCapture(capture);
                if (capture) {
                  setLatitude(capture.latitude);
                  setLongitude(capture.longitude);
                }
                setSubmissionError('');
              }}
            />
            {submissionError && (
              <div role="alert" className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {submissionError}
              </div>
            )}

            {/* Submit */}
            <div className="flex justify-end gap-2.5 pt-3 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition cursor-pointer font-medium text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !photoCapture}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-xs shadow-xs transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>Submit & Run Recurrence Check</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
