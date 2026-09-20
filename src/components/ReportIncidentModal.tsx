import React, { useState } from 'react';
import { X, Plus, AlertOctagon, MapPin, Tag, ShieldAlert, Sparkles } from 'lucide-react';
import { useCivicPulse } from '../context/CivicPulseContext';
import { IncidentCategory, IncidentSeverity, IncidentSource } from '../types';

export const ReportIncidentModal: React.FC = () => {
  const {
    isReportModalOpen,
    setIsReportModalOpen,
    reportIncident,
    setSelectedIncidentId,
    setCurrentPage,
    hotspots,
  } = useCivicPulse();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<IncidentCategory>('Pothole');
  const [severity, setSeverity] = useState<IncidentSeverity>('medium');
  const [address, setAddress] = useState('');
  const [zone, setZone] = useState('South Zone');
  const [source, setSource] = useState<IncidentSource>('Citizen Report');
  const [tagInput, setTagInput] = useState('pavement, monsoon');
  const [linkedHotspot, setLinkedHotspot] = useState<string>('');

  if (!isReportModalOpen) return null;

  const handleSelectHotspot = (hotspotId: string) => {
    setLinkedHotspot(hotspotId);
    if (!hotspotId) return;
    const h = hotspots.find((item) => item.id === hotspotId);
    if (h) {
      setAddress(h.address);
      setZone(h.zone);
      setCategory(h.dominantCategory);
      setTitle(`Recurrence at ${h.locationName}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !address.trim()) return;

    const tags = tagInput
      .split(',')
      .map((t) => t.trim().toLowerCase().replace(/\s+/g, '_'))
      .filter(Boolean);

    // Find linked incidents if this address matches an existing hotspot
    let relatedIncidentIds: string[] = [];
    let recurrenceCount = 0;
    if (linkedHotspot) {
      const h = hotspots.find((item) => item.id === linkedHotspot);
      if (h) {
        relatedIncidentIds = [...h.linkedIncidentIds];
        recurrenceCount = h.incidentCount;
      }
    }

    const created = reportIncident({
      title: title.trim(),
      description:
        description.trim() ||
        `Citizen infrastructure report logged at ${address}. Flagged for municipal verification.`,
      category,
      severity,
      status: 'active',
      latitude: 26.8522,
      longitude: 75.8016,
      address: address.trim(),
      zone,
      source,
      tags,
      imageUrl: null,
      aiAnalysis: null,
      relatedIncidentIds,
      recurrenceCount,
      repairEventIds: [],
      assignedTeam: 'Rapid Response Unit',
    });

    setIsReportModalOpen(false);
    setSelectedIncidentId(created.id);
  };

  return (
    <div
      id="report-incident-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={() => setIsReportModalOpen(false)}
    >
      <div
        id="report-incident-card"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-600 text-white rounded-lg">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 leading-tight">
                Report Civic Infrastructure Incident
              </h2>
              <p className="text-[11px] text-slate-500">
                CivicPulse will cross-reference location history to flag recurring failures
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsReportModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {/* AI Intake Flow Switcher Banner */}
          <div className="p-3 bg-gradient-to-r from-indigo-50 to-indigo-100/70 border border-indigo-200 rounded-xl text-xs flex items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-indigo-600 text-white shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-indigo-950">AI Multimodal Intake & Memory Engine</p>
                <p className="text-[11px] text-indigo-800">Upload a photo to run Gemini vision, detect duplicate reports, and trace failure lineage.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsReportModalOpen(false);
                setCurrentPage('report');
              }}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shrink-0 transition-colors cursor-pointer"
            >
              Open AI Flow →
            </button>
          </div>

          {/* Quick Hotspot Picker */}
          <div className="p-3 bg-purple-50/60 border border-purple-100 rounded-xl text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-purple-900">
              <ShieldAlert className="w-4 h-4 text-purple-600" />
              <span>Report at an Existing Chronic Hotspot (Demonstrates Recurrence)</span>
            </div>
            <p className="text-[11px] text-purple-700">
              Select a known failure location to automatically link prior repair history and increment recurrence.
            </p>
            <select
              value={linkedHotspot}
              onChange={(e) => handleSelectHotspot(e.target.value)}
              className="w-full mt-1 px-3 py-1.5 text-xs bg-white border border-purple-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-purple-500"
            >
              <option value="">— Choose a chronic location or enter new address below —</option>
              {hotspots.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.locationName} ({h.dominantCategory} • {h.incidentCount} prior failures)
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Incident Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Deep Asphalt Crater Near Flyover Descent"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-900"
            />
          </div>

          {/* Category & Severity Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Infrastructure Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as IncidentCategory)}
                className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-900"
              >
                <option value="Pothole">Pothole</option>
                <option value="Broken Streetlight">Broken Streetlight</option>
                <option value="Garbage Overflow">Garbage Overflow</option>
                <option value="Water Leakage">Water Leakage</option>
                <option value="Drainage Issue">Drainage Issue</option>
                <option value="Damaged Footpath">Damaged Footpath</option>
                <option value="Traffic Signal Issue">Traffic Signal Issue</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Assessed Severity
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as IncidentSeverity)}
                className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-900"
              >
                <option value="low">Low (Minor cosmetic issue)</option>
                <option value="medium">Medium (Standard priority)</option>
                <option value="high">High (Hazardous / arterial road)</option>
                <option value="critical">Critical (Immediate safety risk)</option>
              </select>
            </div>
          </div>

          {/* Address & Zone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Address / Location *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Pillar 14, Tonk Corridor Junction"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Metropolitan Zone
              </label>
              <select
                value={zone}
                onChange={(e) => setZone(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-900"
              >
                <option value="South Zone">South Zone</option>
                <option value="Central Zone">Central Zone</option>
                <option value="West Zone">West Zone</option>
                <option value="South-East Zone">South-East Zone</option>
                <option value="Central-West Zone">Central-West Zone</option>
                <option value="North Zone">North Zone</option>
                <option value="North-West Zone">North-West Zone</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Issue Description
            </label>
            <textarea
              rows={3}
              placeholder="Describe surface dimensions, pedestrian hazard, or observed water flow..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
            />
          </div>

          {/* Source & Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reporting Source
              </label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value as IncidentSource)}
                className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-900"
              >
                <option value="Citizen Report">Citizen Report</option>
                <option value="Operator Entry">Operator Entry</option>
                <option value="Sensor Network">Sensor Network</option>
                <option value="Demo Data">Demo Data</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tags (Comma separated)
              </label>
              <input
                type="text"
                placeholder="pothole, rain_damage"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-900"
              />
            </div>
          </div>

          {/* Submit Controls */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsReportModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
            >
              Log Incident into City Memory
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
