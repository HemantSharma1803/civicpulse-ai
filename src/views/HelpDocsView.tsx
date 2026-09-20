import React from 'react';
import {
  HelpCircle,
  Database,
  Sparkles,
  GitBranch,
  ShieldCheck,
  Flame,
  Wrench,
  CheckCircle2,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { useCivicPulse } from '../context/CivicPulseContext';

export const HelpDocsView: React.FC = () => {
  const { setCurrentPage } = useCivicPulse();

  return (
    <div id="help-docs-container" className="space-y-6 pb-12 max-w-4xl">
      {/* Header */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2 mb-1">
          <span className="p-1 bg-indigo-600 text-white rounded-md">
            <HelpCircle className="w-3.5 h-3.5" />
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 font-mono-code">
            DOCUMENTATION & HACKATHON GUIDE
          </span>
        </div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          CivicPulse AI Architecture & Product Guide
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Everything judges and civic officials need to understand about the “City’s Memory” paradigm.
        </p>
      </div>

      {/* CORE PHILOSOPHY */}
      <div className="p-6 bg-gradient-to-br from-indigo-950 to-slate-900 text-white rounded-2xl border border-indigo-800/40 shadow-sm space-y-3">
        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 font-mono-code">
          PRODUCT CORE THESIS
        </span>
        <h3 className="text-xl font-black tracking-tight">
          “Cities record complaints. CivicPulse remembers failures.”
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          Traditional civic complaint systems treat every citizen complaint as a disconnected ticket. A pothole reported on Tonk Road is marked closed. Three weeks later, the exact same pothole opens again — but the city creates Ticket #2049 with zero memory of Ticket #1048.
        </p>
        <p className="text-xs text-indigo-200 font-medium">
          CivicPulse links incidents by spatial coordinates and time, exposing repeat failure cycles, tracking patch longevity, and giving city leadership the memory required to hold contractors accountable.
        </p>
      </div>

      {/* COMPARISON TABLE */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Traditional 311 Systems vs. CivicPulse AI
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Dimension</th>
                <th className="py-2.5 px-3 text-slate-500">Traditional 311 / CRM</th>
                <th className="py-2.5 px-3 text-indigo-700">CivicPulse AI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-3 px-3 font-semibold text-slate-900">Ticket Lifecycle</td>
                <td className="py-3 px-3 text-slate-600">Isolated. Closes ticket and wipes memory.</td>
                <td className="py-3 px-3 text-indigo-700 font-medium">Lineage. Connects to prior failures at same GPS node.</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-semibold text-slate-900">Contractor Accountability</td>
                <td className="py-3 px-3 text-slate-600">None. Contractor gets paid per repair event.</td>
                <td className="py-3 px-3 text-indigo-700 font-medium">Durability Auditing. Tracks mean days before re-failure.</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-semibold text-slate-900">Recurrence Detection</td>
                <td className="py-3 px-3 text-slate-600">Manual citizen complaints; no temporal memory.</td>
                <td className="py-3 px-3 text-indigo-700 font-medium">Automated Chronic Hotspot clustering & warning flags.</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-semibold text-slate-900">Health Scoring</td>
                <td className="py-3 px-3 text-slate-600">Subjective or nonexistent.</td>
                <td className="py-3 px-3 text-indigo-700 font-medium">Transparent, mathematically explainable derivation.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ARCHITECTURAL LAYERS */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Intelligence Architecture Roadmap
        </h3>

        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-indigo-900">
                Layer 1: Foundational Intelligence & Failure Memory (Current Build)
              </span>
              <span className="px-2 py-0.5 text-[9px] font-bold bg-indigo-600 text-white rounded">
                COMPLETED & ACTIVE
              </span>
            </div>
            <p className="text-xs text-indigo-800 mt-1 leading-relaxed">
              Spatial coordinate grouping (250m radius), chronological lineage tracking, contractor repair longevity auditing, and transparent derived health scoring across 54 realistic municipal incidents.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-800">
                Layer 2: Multimodal Gemini Vision & Subsurface Infiltration Estimation
              </span>
              <span className="px-2 py-0.5 text-[9px] font-bold bg-slate-200 text-slate-600 rounded">
                PLANNED PHASE
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Accepting citizen camera captures through server-side Gemini 2.5 Flash to automatically estimate crater depth, identify alligator cracking vs shear failure, and calculate structural repair budgets.
            </p>
          </div>
        </div>
      </div>

      {/* QUICK JUMP */}
      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-700">
          Ready to test the Failure Memory engine?
        </span>
        <button
          onClick={() => setCurrentPage('failure-memory')}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
        >
          <span>Open Failure Memory</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
