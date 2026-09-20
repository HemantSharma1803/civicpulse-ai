import React, { useState } from 'react';
import {
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldAlert,
  Building,
  DollarSign,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useCivicPulse } from '../context/CivicPulseContext';

export const OperationsView: React.FC = () => {
  const { repairs, setSelectedIncidentId, setCurrentPage } = useCivicPulse();
  const [selectedContractor, setSelectedContractor] = useState<string>('all');

  const contractors = [
    {
      name: 'Apex Roadworks Ltd',
      totalRepairs: 8,
      recurrenceRate: '45.0%',
      avgDurabilityDays: '18 Days',
      status: 'Warning: Low Patch Lifespan',
      statusVariant: 'alert',
    },
    {
      name: 'BuildCorp Infrastructure',
      totalRepairs: 6,
      recurrenceRate: '28.5%',
      avgDurabilityDays: '34 Days',
      status: 'Standard Performance',
      statusVariant: 'normal',
    },
    {
      name: 'Municipal In-House Rapid Response',
      totalRepairs: 10,
      recurrenceRate: '31.2%',
      avgDurabilityDays: '29 Days',
      status: 'High Response, Moderate Durability',
      statusVariant: 'normal',
    },
  ];

  const filteredRepairs = repairs.filter((r) =>
    selectedContractor === 'all' ? true : r.contractorOrTeam.includes(selectedContractor)
  );

  return (
    <div id="operations-view-container" className="space-y-6 pb-12">
      {/* Header */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1 bg-indigo-600 text-white rounded-md">
                <Wrench className="w-3.5 h-3.5" />
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 font-mono-code">
                MUNICIPAL FIELD OPERATIONS
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Contractor Remediation Durability & Work Orders
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 max-w-2xl leading-relaxed">
              Evaluating the empirical longevity of municipal repairs. When a patch fails within 21 days, CivicPulse flags the contractor for durability non-compliance.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono-code font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl">
              {repairs.length} Logged Repair Events
            </span>
          </div>
        </div>
      </div>

      {/* Contractor Durability Scorecards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {contractors.map((c) => (
          <div
            key={c.name}
            className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">{c.name}</span>
                <Building className="w-4 h-4 text-slate-400" />
              </div>

              <div className="grid grid-cols-3 gap-2 mt-3 p-2.5 bg-slate-50 rounded-xl text-center">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">REPAIRS</span>
                  <span className="text-xs font-mono-code font-bold text-slate-900">
                    {c.totalRepairs}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">LIFESPAN</span>
                  <span className="text-xs font-mono-code font-bold text-amber-700">
                    {c.avgDurabilityDays}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">RECURRENCE</span>
                  <span className="text-xs font-mono-code font-bold text-purple-700">
                    {c.recurrenceRate}
                  </span>
                </div>
              </div>
            </div>

            <div
              className={`p-2 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 ${
                c.statusVariant === 'alert'
                  ? 'bg-rose-50 text-rose-800 border border-rose-200'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              }`}
            >
              {c.statusVariant === 'alert' ? (
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              )}
              <span className="truncate">{c.status}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Repair Event Log Directory */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Work Order Log & Remediation History</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Historical repair interventions logged against civic complaint coordinates.
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredRepairs.map((rep) => (
            <div
              key={rep.id}
              onClick={() => setSelectedIncidentId(rep.incidentId)}
              className="py-3 px-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="p-2 bg-indigo-50 text-indigo-700 rounded-lg shrink-0 mt-0.5">
                  <Wrench className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono-code text-xs font-bold text-indigo-600">
                      {rep.id}
                    </span>
                    <span className="text-xs font-bold text-slate-900">{rep.action}</span>
                    <span className="text-[10px] font-mono-code font-bold px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded">
                      Linked to {rep.incidentId}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{rep.description}</p>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                    <span>Contractor: <strong>{rep.contractorOrTeam}</strong></span>
                    <span>Cost: <strong className="text-slate-700">{rep.costEstimate || 'N/A'}</strong></span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 sm:self-center">
                <span className="text-[11px] text-slate-500">
                  {new Date(rep.date).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
                <span className="text-xs font-mono-code text-indigo-600 font-semibold">
                  Inspect Incident →
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
