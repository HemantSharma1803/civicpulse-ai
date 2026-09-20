import React from 'react';
import { Check, Camera, Eye, MapPin, History, FileCheck, CheckCircle2 } from 'lucide-react';

export type ReportStepId = 1 | 2 | 3 | 4 | 5 | 6;

interface StepDef {
  id: ReportStepId;
  code: string;
  label: string;
  icon: React.ElementType;
}

export const REPORT_STEPS: StepDef[] = [
  { id: 1, code: '01', label: 'REPORT', icon: Camera },
  { id: 2, code: '02', label: 'AI VISION', icon: Eye },
  { id: 3, code: '03', label: 'LOCATION', icon: MapPin },
  { id: 4, code: '04', label: 'MEMORY CHECK', icon: History },
  { id: 5, code: '05', label: 'REVIEW', icon: FileCheck },
  { id: 6, code: '06', label: 'SUBMITTED', icon: CheckCircle2 },
];

interface ReportStepperProps {
  currentStep: ReportStepId;
  maxStepReached: ReportStepId;
  onStepClick: (step: ReportStepId) => void;
}

export const ReportStepper: React.FC<ReportStepperProps> = ({
  currentStep,
  maxStepReached,
  onStepClick,
}) => {
  return (
    <nav aria-label="Incident Reporting Steps" className="w-full">
      <div className="flex items-center justify-between overflow-x-auto py-2 px-1 scrollbar-none">
        {REPORT_STEPS.map((step, idx) => {
          const isCompleted = step.id < currentStep || (currentStep === 6 && step.id === 6);
          const isCurrent = step.id === currentStep;
          const isClickable = step.id <= maxStepReached && step.id !== currentStep && currentStep !== 6;
          const Icon = step.icon;

          return (
            <React.Fragment key={step.id}>
              {/* Step item */}
              <button
                type="button"
                onClick={() => isClickable && onStepClick(step.id)}
                disabled={!isClickable}
                id={`report-stepper-step-${step.id}`}
                aria-current={isCurrent ? 'step' : undefined}
                className={`group flex items-center gap-2.5 py-1.5 px-2.5 rounded-lg transition-all text-left shrink-0 ${
                  isCurrent
                    ? 'bg-indigo-50 border border-indigo-200 text-indigo-900 shadow-xs'
                    : isClickable
                    ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 cursor-pointer'
                    : 'text-slate-400 cursor-not-allowed opacity-75'
                }`}
              >
                {/* Step badge / icon */}
                <div
                  className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-all ${
                    isCurrent
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                  }`}
                >
                  {isCompleted && step.id !== 6 ? (
                    <Check className="w-4 h-4 stroke-[2.5]" />
                  ) : (
                    <Icon className="w-3.5 h-3.5" />
                  )}
                </div>

                {/* Step label */}
                <div className="flex flex-col">
                  <span
                    className={`font-mono text-[10px] uppercase font-bold tracking-wider ${
                      isCurrent
                        ? 'text-indigo-600'
                        : isCompleted
                        ? 'text-emerald-700'
                        : 'text-slate-400'
                    }`}
                  >
                    STEP {step.code}
                  </span>
                  <span
                    className={`text-xs font-semibold whitespace-nowrap ${
                      isCurrent ? 'text-indigo-950 font-bold' : 'text-slate-700'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              </button>

              {/* Step connecting divider */}
              {idx < REPORT_STEPS.length - 1 && (
                <div
                  className={`hidden sm:block flex-1 h-0.5 mx-2 min-w-4 transition-colors ${
                    step.id < currentStep ? 'bg-emerald-500' : 'bg-slate-200'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </nav>
  );
};
