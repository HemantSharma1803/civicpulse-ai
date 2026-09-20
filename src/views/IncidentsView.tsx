import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  Plus,
  AlertOctagon,
  MapPin,
  Calendar,
  History,
  Tag,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { useCivicPulse } from '../context/CivicPulseContext';
import { Incident, IncidentCategory, IncidentSeverity, IncidentStatus } from '../types';

export const IncidentsView: React.FC = () => {
  const {
    incidents,
    setSelectedIncidentId,
    setIsReportModalOpen,
    filterCategory,
    setFilterCategory,
  } = useCivicPulse();

  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [zoneFilter, setZoneFilter] = useState<string>('all');
  const [recurrenceOnly, setRecurrenceOnly] = useState<boolean>(false);

  const [sortField, setSortField] = useState<'createdAt' | 'severity' | 'recurrenceCount' | 'category'>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const [currentPageNum, setCurrentPageNum] = useState<number>(1);
  const itemsPerPage = 10;

  // Filtered & Sorted Incidents
  const filteredIncidents = useMemo(() => {
    return incidents.filter((item) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesQuery =
          item.id.toLowerCase().includes(q) ||
          item.title.toLowerCase().includes(q) ||
          item.address.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          (item.tags && item.tags.some((t) => t.toLowerCase().includes(q)));
        if (!matchesQuery) return false;
      }

      // Category
      if (filterCategory && item.category !== filterCategory) return false;

      // Severity
      if (severityFilter !== 'all' && item.severity !== severityFilter) return false;

      // Status
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;

      // Zone
      if (zoneFilter !== 'all' && item.zone !== zoneFilter) return false;

      // Recurrence
      if (recurrenceOnly && item.recurrenceCount === 0) return false;

      return true;
    });
  }, [
    incidents,
    searchQuery,
    filterCategory,
    severityFilter,
    statusFilter,
    zoneFilter,
    recurrenceOnly,
  ]);

  const sortedIncidents = useMemo(() => {
    return [...filteredIncidents].sort((a, b) => {
      let comparison = 0;
      if (sortField === 'createdAt') {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortField === 'recurrenceCount') {
        comparison = a.recurrenceCount - b.recurrenceCount;
      } else if (sortField === 'severity') {
        const order: Record<IncidentSeverity, number> = { low: 1, medium: 2, high: 3, critical: 4 };
        comparison = order[a.severity] - order[b.severity];
      } else if (sortField === 'category') {
        comparison = a.category.localeCompare(b.category);
      }
      return sortDirection === 'desc' ? -comparison : comparison;
    });
  }, [filteredIncidents, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(sortedIncidents.length / itemsPerPage) || 1;
  const paginatedIncidents = useMemo(() => {
    const start = (currentPageNum - 1) * itemsPerPage;
    return sortedIncidents.slice(start, start + itemsPerPage);
  }, [sortedIncidents, currentPageNum]);

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'high':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'medium':
        return 'bg-sky-100 text-sky-800 border-sky-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'in_progress':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'investigating':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-rose-50 text-rose-700 border-rose-200';
    }
  };

  return (
    <div id="incidents-view-container" className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Municipal Incident Directory
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Tracking {incidents.length} seeded city infrastructure complaints with historical failure links.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsReportModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Report Incident</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {/* Search Box */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search title, address, ID or tags..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPageNum(1);
              }}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={filterCategory || 'all'}
              onChange={(e) => {
                setFilterCategory(e.target.value === 'all' ? null : (e.target.value as IncidentCategory));
                setCurrentPageNum(1);
              }}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 font-medium"
            >
              <option value="all">All Categories</option>
              <option value="Pothole">Pothole</option>
              <option value="Broken Streetlight">Broken Streetlight</option>
              <option value="Garbage Overflow">Garbage Overflow</option>
              <option value="Water Leakage">Water Leakage</option>
              <option value="Drainage Issue">Drainage Issue</option>
              <option value="Damaged Footpath">Damaged Footpath</option>
              <option value="Traffic Signal Issue">Traffic Signal Issue</option>
            </select>
          </div>

          {/* Severity Filter */}
          <div>
            <select
              value={severityFilter}
              onChange={(e) => {
                setSeverityFilter(e.target.value);
                setCurrentPageNum(1);
              }}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 font-medium"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPageNum(1);
              }}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 font-medium"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="investigating">Investigating</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          {/* Recurrence Toggle */}
          <div className="flex items-center">
            <button
              onClick={() => {
                setRecurrenceOnly((prev) => !prev);
                setCurrentPageNum(1);
              }}
              className={`w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border transition-colors ${
                recurrenceOnly
                  ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Only Recurrent</span>
            </button>
          </div>
        </div>

        {/* Active Filter Chips */}
        {(filterCategory || severityFilter !== 'all' || statusFilter !== 'all' || recurrenceOnly || searchQuery) && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
            <span className="text-[11px] text-slate-400 font-medium">Active filters:</span>
            {filterCategory && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-semibold">
                Category: {filterCategory}
                <button onClick={() => setFilterCategory(null)} className="hover:text-indigo-900">×</button>
              </span>
            )}
            {severityFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[11px] font-semibold">
                Severity: {severityFilter}
                <button onClick={() => setSeverityFilter('all')} className="hover:text-amber-900">×</button>
              </span>
            )}
            {statusFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-semibold">
                Status: {statusFilter}
                <button onClick={() => setStatusFilter('all')} className="hover:text-emerald-900">×</button>
              </span>
            )}
            {recurrenceOnly && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-50 text-purple-800 text-[11px] font-semibold">
                Recurring Failures Only
                <button onClick={() => setRecurrenceOnly(false)} className="hover:text-purple-900">×</button>
              </span>
            )}
            <button
              onClick={() => {
                setFilterCategory(null);
                setSeverityFilter('all');
                setStatusFilter('all');
                setZoneFilter('all');
                setRecurrenceOnly(false);
                setSearchQuery('');
              }}
              className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 underline ml-2"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Incidents Table / List Hybrid */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4 font-mono-code">ID</th>
                <th className="py-3.5 px-4 min-w-[240px]">Title & Address</th>
                <th
                  onClick={() => handleSort('category')}
                  className="py-3.5 px-4 cursor-pointer hover:text-slate-900 select-none"
                >
                  <div className="flex items-center gap-1">
                    <span>Category</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('severity')}
                  className="py-3.5 px-4 cursor-pointer hover:text-slate-900 select-none"
                >
                  <div className="flex items-center gap-1">
                    <span>Severity</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3.5 px-4">Status</th>
                <th
                  onClick={() => handleSort('recurrenceCount')}
                  className="py-3.5 px-4 cursor-pointer hover:text-slate-900 select-none"
                >
                  <div className="flex items-center gap-1">
                    <span>Recurrence Memory</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('createdAt')}
                  className="py-3.5 px-4 cursor-pointer hover:text-slate-900 select-none"
                >
                  <div className="flex items-center gap-1">
                    <span>Reported</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3.5 px-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedIncidents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 text-xs">
                    No incidents matched your selected filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedIncidents.map((inc) => (
                  <tr
                    key={inc.id}
                    onClick={() => setSelectedIncidentId(inc.id)}
                    className="hover:bg-indigo-50/40 cursor-pointer transition-colors group"
                  >
                    {/* ID */}
                    <td className="py-3.5 px-4 font-mono-code font-bold text-indigo-600">
                      {inc.id}
                    </td>

                    {/* Title & Address */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 group-hover:text-indigo-900 transition-colors">
                        {inc.title}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5 truncate">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{inc.address}</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-slate-600">{inc.zone}</span>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-slate-700">{inc.category}</span>
                    </td>

                    {/* Severity */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase border ${getSeverityBadge(
                          inc.severity
                        )}`}
                      >
                        {inc.severity}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 text-[10px] font-semibold rounded-full capitalize border ${getStatusBadge(
                          inc.status
                        )}`}
                      >
                        {inc.status.replace('_', ' ')}
                      </span>
                    </td>

                    {/* Recurrence */}
                    <td className="py-3.5 px-4">
                      {inc.recurrenceCount > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-purple-100 text-purple-800 border border-purple-200">
                          <History className="w-3 h-3 text-purple-600" />
                          {inc.recurrenceCount}x Recurrent
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400">Isolated</span>
                      )}
                    </td>

                    {/* Reported */}
                    <td className="py-3.5 px-4 text-slate-500 text-[11px] whitespace-nowrap">
                      {new Date(inc.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedIncidentId(inc.id);
                        }}
                        className="p-1 text-slate-400 group-hover:text-indigo-600 rounded transition-colors"
                        title="Open incident drawer"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-50/80 border-t border-slate-200 text-xs text-slate-600">
          <div>
            Showing{' '}
            <strong className="font-mono-code text-slate-900">
              {filteredIncidents.length === 0 ? 0 : (currentPageNum - 1) * itemsPerPage + 1}
            </strong>{' '}
            to{' '}
            <strong className="font-mono-code text-slate-900">
              {Math.min(currentPageNum * itemsPerPage, filteredIncidents.length)}
            </strong>{' '}
            of <strong className="font-mono-code text-slate-900">{filteredIncidents.length}</strong> incidents
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPageNum((p) => Math.max(p - 1, 1))}
              disabled={currentPageNum === 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono-code text-xs font-semibold px-2">
              Page {currentPageNum} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPageNum((p) => Math.min(p + 1, totalPages))}
              disabled={currentPageNum === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
