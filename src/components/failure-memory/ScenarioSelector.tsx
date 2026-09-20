import React from 'react';
import {
  CheckCircle2,
  Database,
  HelpCircle,
  Play,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { useCivicPulse } from '../../context/CivicPulseContext';
import {
  MEMORY_SCENARIOS,
  ScenarioKey,
} from '../../services/failure-memory';

interface ScenarioSelectorProps {
  className?: string;
  onScenarioLoaded?: (scenarioKey: ScenarioKey) => void;
}

export const ScenarioSelector: React.FC<ScenarioSelectorProps> = ({
  className = '',
  onScenarioLoaded,
}) => {
  const { activeScenario, loadScenario, resetDemoData } = useCivicPulse();

  const scenariosList = Object.values(MEMORY_SCENARIOS);
  const currentScenarioDef = activeScenario
    ? MEMORY_SCENARIOS[activeScenario]
    : MEMORY_SCENARIOS.persistent;

  const handleSelect = (key: ScenarioKey) => {
    loadScenario(key);
    if (onScenarioLoaded) {
      onScenarioLoaded(key);
    }
  };

  return (
    <div
      id="scenario-selector-panel"
      className={`rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50/60 to-white p-5 shadow-sm ${className}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-indigo-100/70 pb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-xs">
            <Sparkles className="h-4 w-4" />
          </span>
          <div>
            <h4 className="font-semibold text-xs text-indigo-950 uppercase tracking-wider">
              Judge Demonstration Suite — Failure Memory Scenarios
            </h4>
            <p className="text-xs text-slate-500">
              Load real test scenarios to verify CivicPulse memory calculations and recurrence detection
            </p>
          </div>
        </div>

        <button
          onClick={resetDemoData}
          className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-indigo-600"
          title="Reset to default multi-zone dataset"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Reset Dataset</span>
        </button>
      </div>

      {/* Scenario Pill Buttons */}
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {scenariosList.map((sc) => {
          const isSelected = activeScenario === sc.key;
          return (
            <button
              key={sc.key}
              onClick={() => handleSelect(sc.key)}
              className={`flex flex-col items-start rounded-lg border p-2.5 text-left transition-all ${
                isSelected
                  ? 'border-indigo-600 bg-white shadow-sm ring-2 ring-indigo-500/20'
                  : 'border-slate-200 bg-white/80 hover:border-slate-300 hover:bg-white'
              }`}
            >
              <div className="flex w-full items-center justify-between">
                <span
                  className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${sc.badgeColor}`}
                >
                  {sc.badge}
                </span>
                {isSelected && <CheckCircle2 className="h-3.5 w-3.5 text-indigo-600" />}
              </div>
              <span className="mt-1.5 font-semibold text-xs text-slate-900 leading-tight">
                {sc.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Current Scenario Explanation Strip */}
      {currentScenarioDef && (
        <div className="mt-3.5 rounded-lg border border-slate-200/80 bg-white p-3 text-xs text-slate-600">
          <div className="flex flex-wrap items-center justify-between gap-2 font-medium text-slate-900">
            <span>{currentScenarioDef.subtitle}</span>
            <span className="text-[11px] text-indigo-600">
              Expected State: <strong>{currentScenarioDef.expectedState}</strong>
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-600">{currentScenarioDef.description}</p>
          <div className="mt-2 text-[11px] text-slate-500 border-t border-slate-100 pt-1.5">
            <strong className="text-slate-700">Demonstrates: </strong>
            {currentScenarioDef.keyLearning}
          </div>
        </div>
      )}
    </div>
  );
};
