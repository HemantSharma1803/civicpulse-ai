import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  ShieldCheck,
  FileText,
  Filter,
  Layers,
  AlertTriangle,
  TrendingUp,
  Activity,
  Flame,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { useCivicPulse } from '../context/CivicPulseContext';
import { IntelligenceInsight, InsightType, InsightSeverity, InsightStatus, ExecutiveBriefing } from '../services/intelligence/types';
import { insightEngine } from '../services/intelligence/insightEngine';
import { InsightCard } from '../components/intelligence/InsightCard';
import { AskCivicPulsePanel } from '../components/intelligence/AskCivicPulsePanel';
import { InsightEvidenceDrawer } from '../components/intelligence/InsightEvidenceDrawer';
import { ExecutiveBriefingModal } from '../components/intelligence/ExecutiveBriefingModal';

export const AiInsightsView: React.FC = () => {
  const { insights, incidents, hotspots, repairs, user } = useCivicPulse();

  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [inspectingInsight, setInspectingInsight] = useState<IntelligenceInsight | null>(null);
  const [isEvidenceDrawerOpen, setIsEvidenceDrawerOpen] = useState(false);

  const [isBriefingModalOpen, setIsBriefingModalOpen] = useState(false);
  const [briefingData, setBriefingData] = useState<ExecutiveBriefing | null>(null);

  // Filtered Insights
  const filteredInsights = useMemo(() => {
    return (insights as IntelligenceInsight[]).filter((ins) => {
      if (typeFilter !== 'all') {
        if (ins.insightType !== typeFilter) return false;
      }
      if (severityFilter !== 'all') {
        if (ins.severity !== severityFilter) return false;
      }
      if (statusFilter !== 'all') {
        if ((ins.status || 'active') !== statusFilter) return false;
      }
      return true;
    });
  }, [insights, typeFilter, severityFilter, statusFilter]);

  const handleOpenEvidence = (insight: IntelligenceInsight) => {
    setInspectingInsight(insight);
    setIsEvidenceDrawerOpen(true);
  };

  const handleOpenBriefing = () => {
    const briefing = insightEngine.generateExecutiveBriefing(
      incidents,
      hotspots,
      repairs,
      `${user.name}, ${user.role}`
    );
    setBriefingData(briefing);
    setIsBriefingModalOpen(true);
  };

  const typeCounts = useMemo(() => {
    const list = insights as IntelligenceInsight[];
    return {
      all: list.length,
      anomaly: list.filter((i) => i.insightType === 'anomaly').length,
      trend: list.filter((i) => i.insightType === 'trend').length,
      hotspot: list.filter((i) => i.insightType === 'hotspot').length,
      'cross-department': list.filter((i) => i.insightType === 'cross-department').length,
      'data-quality': list.filter((i) => i.insightType === 'data-quality').length,
    };
  }, [insights]);

  return (
    <div id="ai-insights-container" className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1 bg-indigo-600 text-white rounded-md">
                <Sparkles className="w-3.5 h-3.5" />
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 font-mono-code">
                CIVICPULSE AI CITY ANALYST • SEGMENT 5 ENGINE
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              AI Infrastructure Insights & Pattern Discovery
            </h1>
            <p className="text-xs text-slate-500 mt-0.5 max-w-2xl leading-relaxed">
              Two-layer architecture: Deterministic mathematical, spatial, and chronological computation paired with Gemini 3.8 Flash natural language synthesis. No hallucinations, only verifiable civic facts.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold rounded-xl flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>100% Grounded Evidence</span>
            </span>

            <button
              onClick={handleOpenBriefing}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-2xs"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Generate Executive Briefing</span>
            </button>
          </div>
        </div>
      </div>

      {/* Flagship Feature: Ask CivicPulse Natural Language Investigation Panel */}
      <AskCivicPulsePanel />

      {/* Filter and Discovery Toolbar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Type Filter Buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              <span>Pattern Type:</span>
            </span>

            {[
              { key: 'all', label: 'All Patterns', count: typeCounts.all },
              { key: 'cross-department', label: 'Cross-Department', count: typeCounts['cross-department'] },
              { key: 'anomaly', label: 'Anomalies', count: typeCounts.anomaly },
              { key: 'trend', label: 'Trends', count: typeCounts.trend },
              { key: 'hotspot', label: 'Hotspots', count: typeCounts.hotspot },
              { key: 'data-quality', label: 'Data Quality', count: typeCounts['data-quality'] },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setTypeFilter(tab.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  typeFilter === tab.key
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono-code ${
                    typeFilter === tab.key ? 'bg-indigo-700 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Secondary Severity and Status Selectors */}
          <div className="flex items-center gap-2">
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="text-xs font-medium px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical Only</option>
              <option value="high">High Severity</option>
              <option value="medium">Medium Severity</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs font-medium px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="acknowledged">Acknowledged</option>
              <option value="investigating">Investigating</option>
              <option value="actioned">Actioned</option>
              <option value="dismissed">Dismissed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Discovered Insights */}
      {filteredInsights.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredInsights.map((insight) => (
            <InsightCard
              key={insight.id}
              insight={insight}
              onInspectEvidence={handleOpenEvidence}
            />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
          <p className="text-sm font-semibold text-slate-700">
            No insights match the current filter combination.
          </p>
          <button
            onClick={() => {
              setTypeFilter('all');
              setSeverityFilter('all');
              setStatusFilter('all');
            }}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
          >
            Reset All Filters
          </button>
        </div>
      )}

      {/* Evidence Deep-Dive Drawer */}
      <InsightEvidenceDrawer
        insight={inspectingInsight}
        isOpen={isEvidenceDrawerOpen}
        onClose={() => setIsEvidenceDrawerOpen(false)}
      />

      {/* Executive Briefing Modal */}
      <ExecutiveBriefingModal
        briefing={briefingData}
        isOpen={isBriefingModalOpen}
        onClose={() => setIsBriefingModalOpen(false)}
      />

      {/* AI Transparency & Governance Note */}
      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-slate-900 block">
            CivicPulse AI Grounding Architecture Guarantee
          </span>
          <p className="leading-relaxed">
            All percentages, coordinate proximities, repair intervals, and baseline deltas are derived deterministically from the municipal incident registry. The Gemini language model acts strictly as an interpretive and communicative layer, never creating arbitrary metrics. Every insight is 100% traceable to source incident IDs and work orders.
          </p>
        </div>
      </div>
    </div>
  );
};
