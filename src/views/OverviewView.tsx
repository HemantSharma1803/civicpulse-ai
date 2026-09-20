import React from 'react';
import {
  RefreshCw,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Wrench,
  Clock,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  ExternalLink,
  Layers,
  MapPin,
  Flame,
  HelpCircle,
} from 'lucide-react';
import { useCivicPulse } from '../context/CivicPulseContext';
import { DateRangeFilter, IncidentCategory } from '../types';

export const OverviewView: React.FC = () => {
  const {
    metrics,
    categoryHealth,
    insights,
    hotspots,
    activityStream,
    selectedDateRange,
    setSelectedDateRange,
    refreshData,
    isRefreshing,
    setCurrentPage,
    setSelectedIncidentId,
    openMethodology,
    setFilterCategory,
  } = useCivicPulse();

  const getRecurrenceBadge = (state: string) => {
    switch (state) {
      case 'PERSISTENT':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'RECURRENT':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'NEW':
        return 'bg-sky-100 text-sky-800 border-sky-200';
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
  };

  const getHealthColor = (score: number) => {
    if (score < 50) return 'text-rose-600 bg-rose-50 border-rose-200';
    if (score < 70) return 'text-amber-600 bg-amber-50 border-amber-200';
    if (score < 85) return 'text-sky-600 bg-sky-50 border-sky-200';
    return 'text-emerald-600 bg-emerald-50 border-emerald-200';
  };

  return (
    <div id="overview-view-container" className="space-y-8 pb-12">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-6 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200 rounded">
              City Intelligence
            </span>
            <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200 rounded">
              Demo Environment
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            “City infrastructure, with memory.”
          </h2>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Connect incidents, repairs and locations to uncover recurring failures. Traditional systems record complaints — CivicPulse remembers failures.
          </p>
        </div>

        {/* Date-Range Selector & Refresh */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200/70">
            {(['7d', '30d', '90d', 'custom'] as DateRangeFilter[]).map((range) => (
              <button
                key={range}
                onClick={() => setSelectedDateRange(range)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all ${
                  selectedDateRange === range
                    ? 'bg-white text-indigo-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {range === 'custom' ? 'Custom' : `Last ${range}`}
              </button>
            ))}
          </div>

          <button
            onClick={refreshData}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs transition-colors"
            title="Refresh calculations from demo data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* KEY METRIC CARDS (6 Cards calculated mathematically from seeded dataset) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Card 1: Total Incidents */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>TOTAL INCIDENTS</span>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono-code text-slate-900 mt-2">
            {metrics.totalIncidents.value}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
            {metrics.totalIncidents.diff >= 0 ? (
              <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 text-slate-400" />
            )}
            <span className="font-semibold text-slate-700">
              {metrics.totalIncidents.diff >= 0 ? `+${metrics.totalIncidents.diff}` : metrics.totalIncidents.diff}
            </span>
            <span>vs prior period</span>
          </div>
          {/* Micro Trend Line */}
          <div className="w-full h-1 bg-slate-100 rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full w-[78%]" />
          </div>
        </div>

        {/* Card 2: Active Incidents */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>ACTIVE INCIDENTS</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold font-mono-code text-amber-600 mt-2">
            {metrics.activeIncidents.value}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
            <span className="font-semibold text-amber-700">
              {metrics.activeIncidents.diff >= 0 ? `+${metrics.activeIncidents.diff}` : metrics.activeIncidents.diff}
            </span>
            <span>active vs prior</span>
          </div>
          <div className="w-full h-1 bg-slate-100 rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full w-[45%]" />
          </div>
        </div>

        {/* Card 3: Recurring Hotspots */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>RECURRING HOTSPOTS</span>
            <Flame className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-extrabold font-mono-code text-purple-700 mt-2">
            {metrics.recurringHotspots.value}
          </div>
          <div className="text-[11px] text-purple-700 font-medium mt-1 truncate">
            {metrics.recurringHotspots.stateSummary}
          </div>
          <div className="w-full h-1 bg-slate-100 rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-purple-500 rounded-full w-[88%]" />
          </div>
        </div>

        {/* Card 4: Recently Resolved */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>RECENTLY RESOLVED</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold font-mono-code text-emerald-600 mt-2">
            {metrics.recentlyResolved.value}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
            <span className="font-semibold text-emerald-700">
              {metrics.recentlyResolved.diff >= 0 ? `+${metrics.recentlyResolved.diff}` : metrics.recentlyResolved.diff}
            </span>
            <span>field verified</span>
          </div>
          <div className="w-full h-1 bg-slate-100 rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full w-[65%]" />
          </div>
        </div>

        {/* Card 5: Repair Events */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>REPAIR EVENTS</span>
            <Wrench className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-extrabold font-mono-code text-slate-900 mt-2">
            {metrics.repairEvents.value}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Logged work orders
          </div>
          <div className="w-full h-1 bg-slate-100 rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-sky-500 rounded-full w-[52%]" />
          </div>
        </div>

        {/* Card 6: Avg. Recurrence Interval */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>AVG. RECURRENCE</span>
            <Clock className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-extrabold font-mono-code text-indigo-700 mt-2">
            {metrics.avgRecurrenceInterval.value}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 truncate">
            {metrics.avgRecurrenceInterval.description}
          </div>
          <div className="w-full h-1 bg-slate-100 rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full w-[70%]" />
          </div>
        </div>
      </div>

      {/* CITY HEALTH OVERVIEW ("Infrastructure Health") */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Infrastructure Health & Category Vulnerability
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Derived algorithmically from active complaints, recurrence ratios, and severity weighting.
            </p>
          </div>
          <button
            onClick={() => openMethodology('Pothole')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100/80 rounded-lg border border-indigo-200 transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Inspect Score Methodology</span>
          </button>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          {categoryHealth.map((cat) => (
            <div
              key={cat.category}
              className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold text-slate-800">{cat.label}</span>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{cat.description}</p>
                  </div>
                  <span
                    className={`px-2 py-0.5 text-xs font-extrabold font-mono-code rounded-md border ${getHealthColor(
                      cat.healthScore
                    )}`}
                  >
                    {cat.healthScore}
                  </span>
                </div>

                {/* Score Bar */}
                <div className="w-full h-1.5 bg-slate-200 rounded-full mt-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      cat.healthScore < 50
                        ? 'bg-rose-500'
                        : cat.healthScore < 70
                        ? 'bg-amber-500'
                        : cat.healthScore < 85
                        ? 'bg-sky-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${cat.healthScore}%` }}
                  />
                </div>

                {/* Metrics Breakdown */}
                <div className="grid grid-cols-3 gap-2 mt-3 pt-2.5 border-t border-slate-200/60 text-center">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">TOTAL</span>
                    <span className="text-xs font-mono-code font-bold text-slate-800">
                      {cat.incidentVolume}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-amber-600 block font-medium">ACTIVE</span>
                    <span className="text-xs font-mono-code font-bold text-amber-700">
                      {cat.activeCount}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-purple-600 block font-medium">RECURRING</span>
                    <span className="text-xs font-mono-code font-bold text-purple-700">
                      {cat.recurringCount}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between">
                <button
                  onClick={() => {
                    setFilterCategory(cat.category);
                    setCurrentPage('incidents');
                  }}
                  className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  View Incidents ({cat.incidentVolume}) →
                </button>
                <button
                  onClick={() => openMethodology(cat.category)}
                  className="text-[10px] text-slate-400 hover:text-slate-600 font-mono-code"
                >
                  Formula
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MAIN INTELLIGENCE AREA (Split Screen) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Incident Trend Visualization (Volume over time & resolution) */}
        <div className="lg:col-span-6 p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Incident Volume & Failure Trajectory</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Monthly distribution of logged vs re-emerging complaints across Q3
                </p>
              </div>
              <span className="text-[10px] font-mono-code font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                July – Sept 2026
              </span>
            </div>

            {/* Simulated Data-Driven Visual Chart using pure Tailwind */}
            <div className="mt-6 space-y-4">
              {/* July */}
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                  <span>July 2026</span>
                  <span className="font-mono-code text-slate-800">14 Incidents (12 Resolved, 2 Recurring)</span>
                </div>
                <div className="flex h-6 rounded-lg overflow-hidden bg-slate-100 p-0.5 gap-0.5">
                  <div className="bg-emerald-500 h-full rounded-md w-[80%]" title="Resolved (12)" />
                  <div className="bg-purple-500 h-full rounded-md w-[14%]" title="Recurring (2)" />
                  <div className="bg-amber-500 h-full rounded-md w-[6%]" title="Active (0)" />
                </div>
              </div>

              {/* August */}
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                  <span>August 2026 (Monsoon Peak)</span>
                  <span className="font-mono-code text-slate-800">22 Incidents (18 Resolved, 8 Recurring)</span>
                </div>
                <div className="flex h-6 rounded-lg overflow-hidden bg-slate-100 p-0.5 gap-0.5">
                  <div className="bg-emerald-500 h-full rounded-md w-[68%]" title="Resolved (18)" />
                  <div className="bg-purple-500 h-full rounded-md w-[24%]" title="Recurring (8)" />
                  <div className="bg-amber-500 h-full rounded-md w-[8%]" title="Active" />
                </div>
              </div>

              {/* September (Current) */}
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                  <span>September 2026 (Current Window)</span>
                  <span className="font-mono-code text-slate-800">18 Incidents (8 Resolved, 10 Active)</span>
                </div>
                <div className="flex h-6 rounded-lg overflow-hidden bg-slate-100 p-0.5 gap-0.5">
                  <div className="bg-emerald-500 h-full rounded-md w-[44%]" title="Resolved (8)" />
                  <div className="bg-purple-500 h-full rounded-md w-[30%]" title="Recurring Hotspots" />
                  <div className="bg-amber-500 h-full rounded-md w-[26%]" title="Active Tickets" />
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-4 mt-6 pt-4 border-t border-slate-100 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-emerald-500" />
                <span className="text-slate-600">Remediated & Closed</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-purple-500" />
                <span className="text-slate-600">Re-emerged / Recurrent</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-amber-500" />
                <span className="text-slate-600">Under Active Investigation</span>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px] text-slate-500">
            💡 <strong>Failure Memory Signal:</strong> 38% of September potholes occurred at locations that were already remediated in July or August. Traditional systems treat each as a new ticket; CivicPulse connects them to evaluate contractor patch durability.
          </div>
        </div>

        {/* Right: CivicPulse Intelligence (Data-Grounded Insight Cards) */}
        <div className="lg:col-span-6 p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-indigo-600 text-white rounded-md">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">CivicPulse Intelligence</h3>
              </div>
              <span className="text-[10px] font-mono-code font-bold px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded">
                Data-Grounded Insights
              </span>
            </div>

            <div className="mt-3 space-y-3">
              {insights.slice(0, 3).map((insight) => (
                <div
                  key={insight.id}
                  className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200 hover:border-indigo-200 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold text-slate-900 leading-snug">
                      {insight.title}
                    </span>
                    <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-800 rounded shrink-0">
                      {insight.badgeText}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {insight.explanation}
                  </p>
                  <div className="p-2 mt-2 rounded bg-white border border-slate-200 text-[11px] text-slate-700 font-mono-code">
                    <strong className="text-slate-900">Evidence:</strong> {insight.evidence}
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-200/60 text-[10px] text-slate-500">
                    <span>Linked to {insight.relatedIncidentCount} incidents</span>
                    <button
                      onClick={() => setCurrentPage('failure-memory')}
                      className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
                    >
                      Inspect Memory Lineage →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              Grounded exclusively in the seeded municipal dataset.
            </span>
            <button
              onClick={() => setCurrentPage('ai-insights')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              All 4 Insights & Recommendations →
            </button>
          </div>
        </div>
      </div>

      {/* RECURRING HOTSPOTS SECTION */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 bg-purple-600 text-white rounded-md">
                <Flame className="w-3.5 h-3.5" />
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                Recurring Infrastructure Hotspots
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Locations exhibiting repetitive infrastructure breakdowns across multiple maintenance cycles.
            </p>
          </div>

          <button
            onClick={() => setCurrentPage('failure-memory')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-xs transition-colors shrink-0"
          >
            <span>View Full Failure Memory</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Hotspots Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {hotspots.map((hotspot) => (
            <div
              key={hotspot.id}
              className="p-4 rounded-xl bg-slate-50/60 border border-slate-200 hover:border-purple-200 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-purple-600 shrink-0" />
                    <span className="font-bold text-xs text-slate-900 truncate">
                      {hotspot.locationName}
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-md border ${getRecurrenceBadge(
                      hotspot.recurrenceState
                    )}`}
                  >
                    {hotspot.recurrenceState}
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 mt-1 truncate">{hotspot.address}</p>

                {/* Hotspot details */}
                <div className="grid grid-cols-3 gap-2 mt-3 p-2.5 bg-white rounded-lg border border-slate-200/80 text-center">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">FAILURES</span>
                    <span className="text-xs font-mono-code font-bold text-purple-700">
                      {hotspot.incidentCount}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">REPAIRS</span>
                    <span className="text-xs font-mono-code font-bold text-slate-800">
                      {hotspot.repairCount}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">CYCLE</span>
                    <span className="text-xs font-mono-code font-bold text-slate-800">
                      {hotspot.avgIntervalDays}d
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-500">
                  Dominant: <strong className="text-slate-800">{hotspot.dominantCategory}</strong>
                </span>
                <button
                  onClick={() => setCurrentPage('failure-memory')}
                  className="text-[11px] font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1"
                >
                  Lineage →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RECENT INCIDENT ACTIVITY STREAM */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Incident Activity Stream</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live operational event feed grounded strictly in the seeded metropolitan dataset. Click any row to inspect memory lineage.
            </p>
          </div>
          <button
            onClick={() => setCurrentPage('incidents')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
          >
            Explore All 54 Incidents →
          </button>
        </div>

        <div className="divide-y divide-slate-100 mt-2">
          {activityStream.slice(0, 7).map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedIncidentId(item.incidentId)}
              className="py-3 px-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="p-2 rounded-lg bg-slate-100 text-slate-600 shrink-0 mt-0.5">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono-code text-xs font-bold text-indigo-600">
                      {item.incidentId}
                    </span>
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {item.incidentTitle}
                    </span>
                    {item.recurrenceBadge && (
                      <span className="px-1.5 py-0.2 text-[9px] font-bold uppercase bg-purple-100 text-purple-800 rounded">
                        Recurrent
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 truncate mt-0.5">{item.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 sm:self-center">
                <span
                  className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full capitalize ${
                    item.status === 'resolved'
                      ? 'bg-emerald-100 text-emerald-800'
                      : item.status === 'in_progress'
                      ? 'bg-indigo-100 text-indigo-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {item.status.replace('_', ' ')}
                </span>
                <span className="text-[11px] text-slate-400">
                  {new Date(item.timestamp).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
