import React, { useState } from 'react';
import {
  Building2,
  AlertOctagon,
  Flame,
  TrendingUp,
} from 'lucide-react';
import { Incident, Hotspot } from '../../types';

interface ZoneMetrics {
  name: string;
  totalIncidents: number;
  activeCount: number;
  recurrentCount: number;
  vulnerabilityScore: number; // 0-100
  topCategory: string;
  hotspotsCount: number;
}

interface AdministrativeZonalMatrixProps {
  incidents: Incident[];
  hotspots: Hotspot[];
  onSelectIncident: (id: string) => void;
  onNavigateToFailureMemory: () => void;
}

export const AdministrativeZonalMatrix: React.FC<AdministrativeZonalMatrixProps> = ({
  incidents,
  hotspots,
  onSelectIncident,
  onNavigateToFailureMemory,
}) => {
  const [selectedZoneName, setSelectedZoneName] = useState<string>('South Zone');

  const zones: ZoneMetrics[] = [
    {
      name: 'South Zone',
      totalIncidents: 16,
      activeCount: 5,
      recurrentCount: 8,
      vulnerabilityScore: 78,
      topCategory: 'Pothole',
      hotspotsCount: 2,
    },
    {
      name: 'Central Zone',
      totalIncidents: 12,
      activeCount: 3,
      recurrentCount: 5,
      vulnerabilityScore: 68,
      topCategory: 'Traffic Signal Issue',
      hotspotsCount: 1,
    },
    {
      name: 'West Zone',
      totalIncidents: 9,
      activeCount: 2,
      recurrentCount: 4,
      vulnerabilityScore: 62,
      topCategory: 'Drainage Issue',
      hotspotsCount: 1,
    },
    {
      name: 'South-East Zone',
      totalIncidents: 8,
      activeCount: 2,
      recurrentCount: 3,
      vulnerabilityScore: 54,
      topCategory: 'Garbage Overflow',
      hotspotsCount: 1,
    },
    {
      name: 'Central-West Zone',
      totalIncidents: 6,
      activeCount: 1,
      recurrentCount: 2,
      vulnerabilityScore: 48,
      topCategory: 'Water Leakage',
      hotspotsCount: 1,
    },
    {
      name: 'North Zone',
      totalIncidents: 3,
      activeCount: 1,
      recurrentCount: 0,
      vulnerabilityScore: 28,
      topCategory: 'Broken Streetlight',
      hotspotsCount: 0,
    },
  ];

  const currentZone = zones.find((z) => z.name === selectedZoneName) || zones[0];
  const zoneIncidents = incidents.filter((i) => i.zone === selectedZoneName);
  const zoneHotspots = hotspots.filter((h) => h.zone === selectedZoneName);

  return (
    <div className="space-y-6">
      {/* Zonal Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {zones.map((zone) => {
          const isSelected = zone.name === selectedZoneName;
          return (
            <div
              key={zone.name}
              onClick={() => setSelectedZoneName(zone.name)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-indigo-50/70 border-indigo-500 shadow-sm ring-1 ring-indigo-500'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-900">{zone.name}</h3>
                <span
                  className={`text-[10px] font-mono-code font-bold px-2 py-0.5 rounded ${
                    zone.vulnerabilityScore > 70
                      ? 'bg-rose-100 text-rose-800'
                      : zone.vulnerabilityScore > 50
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  Risk: {zone.vulnerabilityScore}/100
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1.5 bg-slate-200 rounded-full mt-3 overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    zone.vulnerabilityScore > 70
                      ? 'bg-rose-500'
                      : zone.vulnerabilityScore > 50
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${zone.vulnerabilityScore}%` }}
                />
              </div>

              <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-200/60 text-center">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">TOTAL</span>
                  <span className="text-xs font-mono-code font-bold text-slate-900">
                    {zone.totalIncidents}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-amber-600 block font-medium">ACTIVE</span>
                  <span className="text-xs font-mono-code font-bold text-amber-700">
                    {zone.activeCount}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-purple-600 block font-medium">RECURRING</span>
                  <span className="text-xs font-mono-code font-bold text-purple-700">
                    {zone.recurrentCount}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-3 text-[11px] text-slate-500">
                <span>
                  Top: <strong className="text-slate-800">{zone.topCategory}</strong>
                </span>
                <span>{zone.hotspotsCount} Chronic Hotspots</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Deep Dive into Selected Zone */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Sector Inspection: {currentZone.name}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Detailed failure breakdown and recorded incidents in this administrative district.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono-code font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded">
              {zoneIncidents.length} Registered Complaints
            </span>
          </div>
        </div>

        {/* Hotspots in Zone */}
        {zoneHotspots.length > 0 && (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-800 flex items-center gap-1.5 mb-3">
              <Flame className="w-4 h-4 text-purple-600" />
              <span>Chronic Hotspots in {currentZone.name}</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {zoneHotspots.map((h) => (
                <div
                  key={h.id}
                  onClick={onNavigateToFailureMemory}
                  className="p-3.5 bg-purple-50/50 hover:bg-purple-50 rounded-xl border border-purple-200 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{h.locationName}</span>
                    <span className="text-[10px] font-mono-code font-bold px-1.5 py-0.5 bg-purple-200 text-purple-900 rounded">
                      {h.incidentCount} Failures
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 truncate">{h.address}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Incidents in Zone */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 mb-3">
            <AlertOctagon className="w-4 h-4 text-slate-500" />
            <span>Recorded Incidents in {currentZone.name}</span>
          </h4>
          <div className="divide-y divide-slate-100">
            {zoneIncidents.map((inc) => (
              <div
                key={inc.id}
                onClick={() => onSelectIncident(inc.id)}
                className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50 px-2 rounded-lg cursor-pointer transition-colors"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono-code font-bold text-xs text-indigo-600">
                      {inc.id}
                    </span>
                    <span className="text-xs font-semibold text-slate-900 truncate">
                      {inc.title}
                    </span>
                    {inc.recurrenceCount > 0 && (
                      <span className="px-1.5 py-0.2 text-[9px] font-bold uppercase bg-purple-100 text-purple-800 rounded">
                        {inc.recurrenceCount}x Recurrent
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">{inc.address}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                      inc.status === 'resolved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {inc.status.replace('_', ' ')}
                  </span>
                  <span className="text-xs font-mono-code text-indigo-600 font-semibold">
                    Inspect →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
