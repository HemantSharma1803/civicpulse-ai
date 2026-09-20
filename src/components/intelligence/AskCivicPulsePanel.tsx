import React, { useState } from 'react';
import {
  Sparkles,
  Search,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Loader2,
  ExternalLink,
  MapPin,
  Compass,
  FileCheck,
  AlertCircle,
  Lightbulb,
} from 'lucide-react';
import { AskCivicPulseQuery } from '../../services/intelligence/types';
import { SUGGESTED_QUERIES, PrebuiltQueryPrompt } from '../../services/intelligence/queryEngine';
import { insightEngine } from '../../services/intelligence/insightEngine';
import { useCivicPulse } from '../../context/CivicPulseContext';

export const AskCivicPulsePanel: React.FC = () => {
  const { incidents, hotspots, setSelectedIncidentId } = useCivicPulse();
  const [queryInput, setQueryInput] = useState('');
  const [isQuerying, setIsQuerying] = useState(false);
  const [currentResult, setCurrentResult] = useState<AskCivicPulseQuery | null>(null);

  const handleRunQuery = async (text: string) => {
    if (!text.trim()) return;
    setIsQuerying(true);
    try {
      const res = await insightEngine.askCivicPulse(text, incidents, hotspots);
      setCurrentResult(res);
    } catch (err) {
      console.error('Query execution error:', err);
    } finally {
      setIsQuerying(false);
    }
  };

  const handlePrebuiltClick = (item: PrebuiltQueryPrompt) => {
    setQueryInput(item.query);
    handleRunQuery(item.query);
  };

  return (
    <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 bg-indigo-600 text-white rounded-md">
              <Cpu className="w-3.5 h-3.5" />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 font-mono-code">
              ASK CIVICPULSE AI ANALYST
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Natural Language Infrastructure Investigation
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Query the entire municipal dataset in plain language. Inquiries are parsed deterministically and interpreted via evidence-grounded AI.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200/80 text-[11px] font-semibold rounded-xl flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Gemini 3.8 Flash Grounding</span>
          </span>
        </div>
      </div>

      {/* Input Bar */}
      <div className="relative">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 pointer-events-none" />
          <input
            type="text"
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRunQuery(queryInput);
            }}
            placeholder="Ask about corridors, failure causes, contractor performance, or rain cascades..."
            className="w-full pl-11 pr-32 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
          />
          <button
            onClick={() => handleRunQuery(queryInput)}
            disabled={isQuerying || !queryInput.trim()}
            className="absolute right-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs"
          >
            {isQuerying ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Scanning...</span>
              </>
            ) : (
              <>
                <span>Analyze</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Suggested Query Pills */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
          <span>Suggested Inquiries:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_QUERIES.map((sq) => (
            <button
              key={sq.id}
              onClick={() => handlePrebuiltClick(sq)}
              className="text-xs px-3 py-1.5 bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-800 border border-slate-200 hover:border-indigo-200 rounded-xl transition-all flex items-center gap-1.5 group text-left"
            >
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white text-slate-500 group-hover:text-indigo-700 border border-slate-200/60 font-mono-code">
                {sq.badge}
              </span>
              <span>{sq.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Query Result Block */}
      {currentResult && (
        <div className="p-5 bg-slate-50/90 rounded-2xl border border-slate-200 space-y-5 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Interpreted Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200/80">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-700">Interpreted Intent:</span>
              <span className="text-xs font-mono-code px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-800">
                {currentResult.interpretedIntent.summary}
              </span>
              {currentResult.interpretedIntent.category && currentResult.interpretedIntent.category !== 'all' && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {currentResult.interpretedIntent.category}
                </span>
              )}
              {currentResult.interpretedIntent.zone && currentResult.interpretedIntent.zone !== 'all' && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-100">
                  {currentResult.interpretedIntent.zone}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span>
                Evidence Base: <strong className="text-slate-800">{currentResult.matchedIncidentIds.length} incidents</strong>
              </span>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-semibold text-[10px]">
                {currentResult.answer.confidence}% Grounded
              </span>
            </div>
          </div>

          {/* Answer Content */}
          <div className="space-y-4">
            {/* Headline */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] uppercase font-bold tracking-wider font-mono-code text-indigo-700">
                  ANALYST SYNTHESIS
                </span>
                <span className="text-[10px] text-slate-400 font-mono-code">
                  Source: {currentResult.answer.source}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 leading-snug">
                {currentResult.answer.headline}
              </h3>
            </div>

            {/* Observed Facts */}
            <div className="p-3.5 bg-white rounded-xl border border-slate-200/80 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono-code block">
                Observed Empirical Facts
              </span>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {currentResult.answer.observedFacts.map((fact, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
                    <span>{fact}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Root-Cause Interpretation */}
            <div className="p-3.5 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-900 font-mono-code block">
                Engineering Root-Cause
              </span>
              <p className="text-xs text-slate-800 leading-relaxed">
                {currentResult.answer.interpretation}
              </p>
            </div>

            {/* Actionable Recommendation */}
            <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-200/70 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-900 font-mono-code block">
                Municipal Action Directive
              </span>
              <p className="text-xs text-emerald-950 font-medium leading-relaxed">
                {currentResult.answer.recommendation}
              </p>
            </div>

            {/* Linked Incidents List */}
            {currentResult.matchedIncidentIds.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-slate-600">
                  Corroborating Incidents:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {currentResult.matchedIncidentIds.slice(0, 8).map((id) => (
                    <button
                      key={id}
                      onClick={() => setSelectedIncidentId(id)}
                      className="px-2.5 py-1 bg-white hover:bg-indigo-50 text-slate-800 hover:text-indigo-900 font-mono-code text-xs font-semibold rounded-lg border border-slate-200 hover:border-indigo-300 transition-colors flex items-center gap-1 shadow-2xs"
                    >
                      <span>{id}</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Limitations Notice */}
            {currentResult.answer.limitations && currentResult.answer.limitations.length > 0 && (
              <div className="text-[11px] text-amber-800 bg-amber-50 p-2.5 rounded-xl border border-amber-200/70 flex items-start gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <span>{currentResult.answer.limitations[0]}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
