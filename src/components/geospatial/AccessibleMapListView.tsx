import React, { useState } from 'react';
import { Incident } from '../../types';
import {
  Search,
  ArrowUpDown,
  ExternalLink,
  Flame,
  AlertTriangle,
  MapPin,
  CheckCircle2,
} from 'lucide-react';

interface AccessibleMapListViewProps {
  incidents: Incident[];
  onSelectIncident: (id: string) => void;
  onOpenDetailDrawer: (id: string) => void;
}

export const AccessibleMapListView: React.FC<AccessibleMapListViewProps> = ({
  incidents,
  onSelectIncident,
  onOpenDetailDrawer,
}) => {
  const [sortField, setSortField] = useState<'createdAt' | 'severity' | 'recurrenceCount'>('createdAt');
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [query, setQuery] = useState<string>('');

  const filtered = incidents.filter(
    (i) =>
      i.id.toLowerCase().includes(query.toLowerCase()) ||
      i.title.toLowerCase().includes(query.toLowerCase()) ||
      i.address.toLowerCase().includes(query.toLowerCase()) ||
      i.category.toLowerCase().includes(query.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    if (sortField === 'createdAt') {
      const diff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return sortAsc ? -diff : diff;
    }
    if (sortField === 'recurrenceCount') {
      const diff = b.recurrenceCount - a.recurrenceCount;
      return sortAsc ? -diff : diff;
    }
    if (sortField === 'severity') {
      const order = { critical: 4, high: 3, medium: 2, low: 1 };
      const diff = order[b.severity] - order[a.severity];
      return sortAsc ? -diff : diff;
    }
    return 0;
  });

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  return (
    <div
      id="accessible-map-list-view"
      className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-4"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Accessible Geospatial Incident Directory
          </h3>
          <p className="text-xs text-slate-500">
            Keyboard-accessible tabular representation of geographic coordinates and failure memory records.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search filtered incidents..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>

      {/* Accessible Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-y border-slate-200">
            <tr>
              <th className="py-2.5 px-3">ID & Title</th>
              <th className="py-2.5 px-3">Category</th>
              <th className="py-2.5 px-3">
                <button
                  onClick={() => toggleSort('severity')}
                  className="flex items-center gap-1 hover:text-slate-700"
                >
                  <span>Severity</span>
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="py-2.5 px-3">
                <button
                  onClick={() => toggleSort('recurrenceCount')}
                  className="flex items-center gap-1 hover:text-slate-700"
                >
                  <span>Recurrence</span>
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="py-2.5 px-3">Coordinates</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sorted.map((inc) => (
              <tr
                key={inc.id}
                className="hover:bg-indigo-50/40 transition-colors focus-within:bg-indigo-50"
              >
                <td className="py-2.5 px-3">
                  <div className="font-mono-code font-bold text-indigo-600 text-[11px]">
                    {inc.id}
                  </div>
                  <div className="font-medium text-slate-900 truncate max-w-xs">{inc.title}</div>
                  <div className="text-[10px] text-slate-400 truncate max-w-xs">{inc.address}</div>
                </td>
                <td className="py-2.5 px-3 font-medium">{inc.category}</td>
                <td className="py-2.5 px-3">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                      inc.severity === 'critical'
                        ? 'bg-rose-100 text-rose-800'
                        : inc.severity === 'high'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {inc.severity}
                  </span>
                </td>
                <td className="py-2.5 px-3">
                  {inc.recurrenceCount > 0 ? (
                    <span className="flex items-center gap-1 text-purple-700 font-mono-code font-bold text-xs">
                      <Flame className="w-3 h-3 text-purple-500" />
                      <span>{inc.recurrenceCount}x Recurrent</span>
                    </span>
                  ) : (
                    <span className="text-slate-400">1st report</span>
                  )}
                </td>
                <td className="py-2.5 px-3 font-mono-code text-[11px] text-slate-600">
                  {inc.latitude.toFixed(4)}, {inc.longitude.toFixed(4)}
                </td>
                <td className="py-2.5 px-3">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] font-semibold capitalize ${
                      inc.status === 'resolved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {inc.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="py-2.5 px-3 text-right">
                  <button
                    onClick={() => onOpenDetailDrawer(inc.id)}
                    className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors font-semibold"
                    title="View Incident Details"
                  >
                    Inspect
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
