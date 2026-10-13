import React, { useState } from 'react';
import {
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
  onSubmitSuccess: () => void;
  currentLang: Language;
}

export const ComplaintFormView: React.FC<Props> = ({
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
      }, 2200);
    } catch (err) {
      console.error('Submit complaint error:', err);
      setSubmissionError(err instanceof Error ? err.message : 'Could not submit the complaint.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Intro Header */}
      <div className="bg-slate-800/60 p-5 rounded-2xl border border-slate-700/60 space-y-2">
        <h1 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-400" />
          <span>{currentLang === 'en' ? 'Citizen Complaint Intake & Recurrence Triage' : 'பொதுமக்கள் புகார் பதிவு மற்றும் மறுநிகழ்வு சோதனை'}</span>
        </h1>
        <p className="text-xs text-slate-300 leading-relaxed">
          {currentLang === 'en'
            ? 'Report drainage failures, waterlogging, or damaged culverts. CivicLoop automatically correlates your report with nearby historical incidents to escalate systemic hotspots.'
            : 'மழைநீர் வடிகால் அடைப்பு மற்றும் வெள்ளநீர் தேங்குதலை பதிவு செய்யவும். உங்கள் பகுதி முந்தைய புகார்களுடன் தானாக இணைக்கப்பட்டு உயர் முன்னுரிமை வழங்கப்படும்.'}
        </p>

        {/* Quick Presets for Demo Evaluation */}
        <div className="pt-2">
          <div className="text-[11px] font-semibold text-indigo-300 mb-1.5 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Try Known Chennai Waterlogging Hotspots (Demo Fast-Fill):</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {presets.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => handleApplyPreset(p)}
                className="px-2.5 py-1 rounded-lg bg-slate-700/60 hover:bg-indigo-600/50 text-slate-300 hover:text-white border border-slate-600 text-xs transition cursor-pointer"
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Submission Success Alert */}
      {submissionResult && (
        <div
          className={`p-4 rounded-xl border flex items-start gap-3 ${
            submissionResult.isPostRepairRelapse
              ? 'bg-rose-950/40 border-rose-500/50 text-rose-200'
              : submissionResult.isRecurrent
              ? 'bg-amber-950/40 border-amber-500/50 text-amber-200'
              : 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
          }`}
        >
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <h4 className="font-bold text-sm">Complaint Registered Successfully!</h4>
            {submissionResult.isPostRepairRelapse ? (
              <p>
                ⚠️ <strong>CRITICAL POST-REPAIR BREACH DETECTED:</strong> This complaint matches a location where GCC previously conducted repairs. Flagged for urgent engineering audit under Cluster <strong>{submissionResult.clusterId}</strong>.
              </p>
            ) : submissionResult.isRecurrent ? (
              <p>
                🔥 <strong>RECURRENCE DETECTED:</strong> Correlated with existing chronic cluster <strong>{submissionResult.clusterId}</strong>. Priority score elevated.
              </p>
            ) : (
              <p>New municipal incident ticket created. Routing to Ward Assistant Engineer.</p>
            )}
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-slate-800/40 p-5 md:p-6 rounded-2xl border border-slate-700/60 space-y-5">
        {/* Category & Severity */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              {t.category}
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ComplaintCategory)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="Waterlogging & Stormwater">Waterlogging & Stormwater Drain</option>
              <option value="Potholes & Road Damage">Potholes & Road Collapse</option>
              <option value="Sewage Overflow">Sewage & Drainage Overflow</option>
              <option value="Solid Waste / Canal Choking">Solid Waste / Canal Choking</option>
              <option value="Streetlight Outage">Streetlight Outage</option>
              <option value="Fallen Tree / Hazard">Fallen Tree / Monsoon Hazard</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              {t.severity}
            </label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value as ComplaintSeverity)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="low">Low (Minor puddle / slow drain)</option>
              <option value="medium">Medium (Ankle deep / pedestrian hindrance)</option>
              <option value="high">High (Knee deep / vehicles stranded)</option>
              <option value="critical">Critical (Waist deep / water entered houses / subway flooded)</option>
            </select>
          </div>
        </div>

        {/* Complaint Title */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300">
            Complaint Headline / Title
          </label>
          <input
            type="text"
            placeholder="e.g., Severe waterlogging opposite Phoenix Mall entrance"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Description & Tanglish Support */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300">
              Description (Tamil, English, or Tanglish)
            </label>
            <button
              type="button"
              onClick={handleTranslateTanglish}
              disabled={isTranslating || !description.trim()}
              className="text-[11px] font-semibold text-violet-400 hover:text-violet-300 flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isTranslating ? t.analyzingWithGemini : t.translateWithAi}</span>
            </button>
          </div>
          <textarea
            rows={3}
            placeholder={t.tanglishHelper}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 leading-relaxed"
          />
          <p className="text-[11px] text-slate-400">
            Tip: You can describe in colloquial Tanglish; Gemini will extract location, category, and create an English synthesis.
          </p>
        </div>

        {/* AI Translation result preview */}
        {englishTranslation && (
          <div className="p-3 rounded-xl bg-violet-950/30 border border-violet-800/40 text-xs space-y-1 text-slate-300">
            <div className="flex items-center gap-1.5 text-violet-400 font-bold text-[11px] uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Gemini English Translation & Normalized Record:</span>
            </div>
            <p className="text-slate-200 italic">{englishTranslation}</p>
          </div>
        )}

        {/* Area, Zone, Ward, Landmark */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Area / Street Name
            </label>
            <input
              type="text"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Landmark
            </label>
            <input
              type="text"
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Chennai Zone
            </label>
            <select
              value={zone}
              onChange={(e) => setZone(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              {CHENNAI_ZONES.map((z) => (
                <option key={z.id} value={z.name}>
                  {z.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Ward Number
            </label>
            <input
              type="number"
              value={ward}
              onChange={(e) => setWard(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* GPS Coordinates */}
        <div className="grid grid-cols-2 gap-4 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
          <div className="space-y-1">
            <label className="text-[11px] text-slate-400 font-medium">Latitude</label>
            <input
              type="number"
              step="any"
              value={latitude}
              onChange={(e) => setLatitude(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] text-slate-400 font-medium">Longitude</label>
            <input
              type="number"
              step="any"
              value={longitude}
              onChange={(e) => setLongitude(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
            />
          </div>
        </div>

        {/* Citizen Contact */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Your Name (Resident)</label>
            <input
              type="text"
              value={citizenName}
              onChange={(e) => setCitizenName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Mobile Phone</label>
            <input
              type="text"
              value={citizenPhone}
              onChange={(e) => setCitizenPhone(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
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
          variant="dark"
        />
        {submissionError && (
          <div role="alert" className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {submissionError}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || !photoCapture}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Correlating with Chennai Recurrence Registry...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Submit Complaint & Trigger Recurrence Intelligence</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
