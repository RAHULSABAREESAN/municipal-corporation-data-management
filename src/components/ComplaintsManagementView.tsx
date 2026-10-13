import React, { useState } from 'react';
import { Complaint, ComplaintCategory, ComplaintSeverity, ComplaintStatus, RecurrenceCluster } from '../types';
import { Language, translations } from '../i18n';
import { CHENNAI_ZONES } from '../data/mockData';
import {
  FileText,
  Search,
  Filter,
  Plus,
  MapPin,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ChevronRight,
  ExternalLink,
  X,
  Sparkles,
  Camera,
  User,
  Phone,
  ShieldAlert,
  ArrowUpDown
} from 'lucide-react';

interface Props {
  complaints: Complaint[];
  clusters: RecurrenceCluster[];
  onSelectCluster: (cluster: RecurrenceCluster) => void;
  onOpenReportModal: () => void;
  currentLang: Language;
}

export const ComplaintsManagementView: React.FC<Props> = ({
  complaints,
  clusters,
  onSelectCluster,
  onOpenReportModal,
  currentLang,
}) => {
  const t = translations[currentLang];
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  // Filter complaints
  const filtered = complaints.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.area.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || c.category === selectedCategory;
    const matchesZone = selectedZone === 'all' || c.zone.includes(selectedZone);
    const matchesSeverity = selectedSeverity === 'all' || c.severity === selectedSeverity;
    const matchesStatus = selectedStatus === 'all' || c.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesZone && matchesSeverity && matchesStatus;
  });

  const getSeverityBadge = (severity: ComplaintSeverity) => {
    switch (severity) {
      case 'critical':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'high':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'medium':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusBadge = (status: ComplaintStatus) => {
    switch (status) {
      case 'verified_resolved':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'work_completed_pending_inspection':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'repair_scheduled':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              Complaints Management
            </h1>
            <span className="text-xs bg-gray-100 text-gray-700 font-semibold px-2 py-0.5 rounded border border-gray-200 tabular-nums">
              {filtered.length} of {complaints.length} Records
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Full civic complaint registry across 15 GCC zones with automated recurrence clustering.
          </p>
        </div>

        <button
          onClick={onOpenReportModal}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs shadow-xs transition cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Report New Complaint</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID, area, or description..."
              className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-xs text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
            />
          </div>

          {/* Category */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-2 text-xs text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
          >
            <option value="all">All Categories</option>
            <option value="Waterlogging & Stormwater">Waterlogging & Stormwater</option>
            <option value="Potholes & Road Damage">Potholes & Road Damage</option>
            <option value="Sewage Overflow">Sewage Overflow</option>
            <option value="Solid Waste / Canal Choking">Solid Waste / Canal Choking</option>
            <option value="Streetlight Outage">Streetlight Outage</option>
            <option value="Fallen Tree / Hazard">Fallen Tree / Hazard</option>
          </select>

          {/* Zone */}
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

          {/* Severity */}
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-2 text-xs text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-500 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Complaint ID</th>
                <th className="py-3 px-4">Subject & Location</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Zone & Ward</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Recurrence Link</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-400">
                    No complaints match your selected search or filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const linkedCluster = clusters.find((cl) => cl.id === item.clusterId);

                  return (
                    <tr
                      key={item.id}
                      onClick={() => setSelectedComplaint(item)}
                      className="hover:bg-gray-50/80 transition cursor-pointer group"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-gray-700">
                        {item.id}
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-bold text-gray-900 group-hover:text-indigo-600 transition truncate">
                          {item.title}
                        </div>
                        <div className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          <span className="truncate">{item.area}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-gray-600 font-medium">
                        {item.category}
                      </td>

                      <td className="py-3.5 px-4 text-gray-600">
                        <div>{item.zone}</div>
                        <div className="text-[10px] text-gray-400">Ward {item.ward}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getSeverityBadge(item.severity)}`}>
                          {item.severity}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        {linkedCluster ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectCluster(linkedCluster);
                            }}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-[10px] font-bold transition"
                            title="Inspect parent recurrence cluster"
                          >
                            <span>{linkedCluster.id}</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </button>
                        ) : (
                          <span className="text-[11px] text-gray-400">Isolated</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getStatusBadge(item.status)}`}>
                          {item.status.replace(/_/g, ' ')}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <span className="text-xs font-semibold text-indigo-600 group-hover:text-indigo-700">
                          View Details →
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

      {/* Complaint Detail Modal/Drawer */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-xl border border-gray-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-gray-100 flex items-start justify-between gap-3 bg-gray-50/50">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-gray-500">
                    {selectedComplaint.id}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getSeverityBadge(selectedComplaint.severity)}`}>
                    {selectedComplaint.severity}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getStatusBadge(selectedComplaint.status)}`}>
                    {selectedComplaint.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <h3 className="text-base font-bold text-gray-900 mt-1">
                  {selectedComplaint.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedComplaint(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              {/* Photo if available */}
              {selectedComplaint.photoUrl && (
                <div className="relative rounded-lg overflow-hidden border border-gray-200 h-44 w-full bg-gray-100">
                  <img
                    src={selectedComplaint.photoUrl}
                    alt={selectedComplaint.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded backdrop-blur-xs flex items-center gap-1">
                    <Camera className="w-3 h-3" />
                    <span>Citizen Photographic Evidence</span>
                  </div>
                </div>
              )}

              {/* Description & Translation */}
              <div className="bg-gray-50 p-3.5 rounded-lg border border-gray-200 space-y-2">
                <div className="flex items-center justify-between text-gray-500 font-semibold text-[11px]">
                  <span>Citizen Report Description</span>
                  <span className="capitalize">{selectedComplaint.originalLanguage} telemetry</span>
                </div>
                <p className="text-gray-900 leading-relaxed font-medium">
                  "{selectedComplaint.description}"
                </p>
                {selectedComplaint.englishTranslation && selectedComplaint.englishTranslation !== selectedComplaint.description && (
                  <div className="pt-2 border-t border-gray-200">
                    <span className="text-[10px] font-bold text-indigo-700 uppercase flex items-center gap-1 mb-1">
                      <Sparkles className="w-3 h-3 text-indigo-600" />
                      Gemini Tanglish Translation
                    </span>
                    <p className="text-gray-700 leading-relaxed italic">
                      "{selectedComplaint.englishTranslation}"
                    </p>
                  </div>
                )}
              </div>

              {/* Location & Metadata Details */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <span className="text-gray-400 text-[10px] block">Location & Landmark</span>
                  <span className="font-semibold text-gray-900 block mt-0.5">{selectedComplaint.area}</span>
                  <span className="text-gray-500 text-[11px] block">{selectedComplaint.landmark}</span>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <span className="text-gray-400 text-[10px] block">Zone & Ward</span>
                  <span className="font-semibold text-gray-900 block mt-0.5">{selectedComplaint.zone}</span>
                  <span className="text-gray-500 text-[11px] block">Ward #{selectedComplaint.ward}</span>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <span className="text-gray-400 text-[10px] block">Reported Timestamp</span>
                  <span className="font-semibold text-gray-900 block mt-0.5">
                    {new Date(selectedComplaint.createdAt).toLocaleString()}
                  </span>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <span className="text-gray-400 text-[10px] block">Citizen Contact</span>
                  <span className="font-semibold text-gray-900 block mt-0.5">
                    {selectedComplaint.citizenName || 'Anonymous Citizen'}
                  </span>
                  <span className="text-gray-500 text-[11px] block font-mono">
                    {selectedComplaint.citizenPhone || 'N/A'}
                  </span>
                </div>
              </div>

              {/* Recurrence Link Callout */}
              {selectedComplaint.clusterId && (
                <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-indigo-700" />
                    <div>
                      <p className="font-bold text-indigo-900 text-xs">Linked Recurrence Cluster</p>
                      <p className="text-[11px] text-indigo-700">Correlated within 450m drainage catchment</p>
                    </div>
                  </div>
                  {clusters.find((c) => c.id === selectedComplaint.clusterId) && (
                    <button
                      onClick={() => {
                        const cl = clusters.find((c) => c.id === selectedComplaint.clusterId);
                        if (cl) {
                          setSelectedComplaint(null);
                          onSelectCluster(cl);
                        }
                      }}
                      className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-medium text-xs transition cursor-pointer"
                    >
                      Inspect Cluster →
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
