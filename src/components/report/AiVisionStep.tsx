import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Edit3,
  RotateCw,
  AlertTriangle,
  HelpCircle,
  Tag,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  Eye,
  Check,
  X,
  FileText,
} from 'lucide-react';
import {
  StructuredVisionAnalysis,
  IncidentCategory,
  ClassificationSource,
  VisualEvidenceItem,
} from '../../types';

interface AiVisionStepProps {
  isAnalyzing: boolean;
  analysis: StructuredVisionAnalysis | null;
  analysisVersion: number;
  classificationSource: ClassificationSource;
  userContextNotes: string;
  errorMessage: string | null;
  onConfirmAnalysis: () => void;
  onUpdateAnalysis: (updated: StructuredVisionAnalysis) => void;
  onReanalyze: () => void;
  onUserContextChange: (notes: string) => void;
  onBack: () => void;
  onProceedToLocation: () => void;
}

const PROCESSING_STAGES = [
  'Inspecting photograph resolution & framing...',
  'Identifying primary civic infrastructure domain...',
  'Extracting direct optical evidence markers...',
  'Estimating potential severity & safety impact...',
  'Synthesizing structured intelligence record...',
];

const CATEGORY_OPTIONS: IncidentCategory[] = [
  'Pothole',
  'Broken Streetlight',
  'Garbage Overflow',
  'Water Leakage',
  'Drainage Issue',
  'Damaged Footpath',
  'Traffic Signal Issue',
];

const SEVERITY_OPTIONS = ['Low', 'Medium', 'High', 'Critical', 'Unclear'] as const;

export const AiVisionStep: React.FC<AiVisionStepProps> = ({
  isAnalyzing,
  analysis,
  analysisVersion,
  classificationSource,
  userContextNotes,
  errorMessage,
  onConfirmAnalysis,
  onUpdateAnalysis,
  onReanalyze,
  onUserContextChange,
  onBack,
  onProceedToLocation,
}) => {
  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const [isEditing, setIsEditing] = useState(false);

  // Edit draft states
  const [editCategory, setEditCategory] = useState<string>('');
  const [editSeverity, setEditSeverity] = useState<string>('');
  const [editSummary, setEditSummary] = useState<string>('');
  const [editTags, setEditTags] = useState<string>('');

  // Cycle through processing stages
  useEffect(() => {
    if (!isAnalyzing) {
      setCurrentStageIdx(0);
      return;
    }
    const interval = setInterval(() => {
      setCurrentStageIdx((prev) => (prev < PROCESSING_STAGES.length - 1 ? prev + 1 : prev));
    }, 1800);
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  // Sync edit draft when entering edit mode
  const startEditing = () => {
    if (analysis) {
      setEditCategory(analysis.primaryCategory);
      setEditSeverity(analysis.severity);
      setEditSummary(analysis.summary);
      setEditTags(analysis.suggestedTags.join(', '));
      setIsEditing(true);
    }
  };

  const saveEdits = () => {
    if (!analysis) return;
    const cleanTags = editTags
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    onUpdateAnalysis({
      ...analysis,
      primaryCategory: editCategory as IncidentCategory,
      severity: editSeverity as StructuredVisionAnalysis['severity'],
      summary: editSummary,
      suggestedTags: cleanTags.length > 0 ? cleanTags : analysis.suggestedTags,
    });
    setIsEditing(false);
  };

  // Severity color helper
  const getSeverityBadge = (sev: string) => {
    switch (sev?.toLowerCase()) {
      case 'critical':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'high':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'medium':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Loading state with animated progress steps */}
      {isAnalyzing && (
        <div className="p-8 border border-slate-200 rounded-xl bg-white text-center space-y-6 shadow-xs">
          <div className="flex items-center justify-center">
            <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-indigo-50 border-2 border-indigo-200">
              <Sparkles className="w-8 h-8 text-indigo-600 animate-pulse" />
              <div className="absolute inset-0 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
            </div>
          </div>

          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-base font-bold text-slate-900">
              CivicPulse Vision Engine Running
            </h3>
            <p className="text-xs font-mono text-indigo-600 font-medium transition-all">
              {PROCESSING_STAGES[currentStageIdx]}
            </p>
          </div>

          <div className="max-w-xs mx-auto flex items-center justify-center gap-2">
            {PROCESSING_STAGES.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i <= currentStageIdx ? 'w-6 bg-indigo-600' : 'w-2 bg-slate-200'
                }`}
              />
            ))}
          </div>

          <p className="text-[11px] text-slate-400">
            Powered by Gemini Multimodal Inspection • Evaluating optical markers
          </p>
        </div>
      )}

      {/* Error or Fallback notification */}
      {!isAnalyzing && errorMessage && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>AI Multimodal Notice</span>
          </div>
          <p className="text-amber-800 leading-relaxed">{errorMessage}</p>
          <p className="text-[11px] text-amber-700">
            CivicPulse has initialized manual review mode. You can classify and submit this incident without interruption.
          </p>
        </div>
      )}

      {/* Main Analysis Card */}
      {!isAnalyzing && analysis && (
        <div className="border border-slate-200 rounded-xl bg-white shadow-xs overflow-hidden">
          {/* Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-slate-50/80 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-6 h-6 rounded-md bg-indigo-600 text-white">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
                CivicPulse Gemini Vision Analysis
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-semibold">
                {analysis.model || 'gemini-3.8-flash'}
              </span>
              {analysisVersion > 1 && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                  v{analysisVersion}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded border ${
                  classificationSource === 'USER_MODIFIED'
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : classificationSource === 'USER_SUPPLIED'
                    ? 'bg-slate-100 text-slate-700 border-slate-300'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                }`}
              >
                Source: {classificationSource.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-5 space-y-5">
            {/* Classification Badges */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-lg font-bold text-slate-900">
                  {analysis.primaryCategory}
                </span>
                <span
                  className={`text-xs font-bold uppercase px-2.5 py-1 rounded-md border ${getSeverityBadge(
                    analysis.severity
                  )}`}
                >
                  {analysis.severity} Severity
                </span>
                {analysis.secondaryCategory && (
                  <span className="text-xs px-2 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                    + {analysis.secondaryCategory}
                  </span>
                )}
                {analysis.requiresHumanReview && (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800 flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3" />
                    Municipal Verification Flagged
                  </span>
                )}
              </div>

              {/* Confidence Meter */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500 font-medium">Confidence:</span>
                <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div
                    className="h-full bg-indigo-600 rounded-full"
                    style={{ width: `${Math.round(analysis.confidence * 100)}%` }}
                  />
                </div>
                <span className="font-mono font-bold text-slate-800">
                  {Math.round(analysis.confidence * 100)}%
                </span>
              </div>
            </div>

            {/* AI Summary */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Defect Summary
                </span>
                <span className="text-[11px] text-slate-400 italic">
                  Grounded in photo pixels
                </span>
              </div>
              <p className="text-sm text-slate-800 bg-slate-50/80 p-3.5 rounded-lg border border-slate-200/80 leading-relaxed">
                {analysis.summary}
              </p>
            </div>

            {/* Visual Evidence Panel (Visible vs Inferred vs Uncertain) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Optical Evidence Markers</span>
                </span>
                <span className="text-[10px] text-slate-500">
                  Distinguishing directly visible markers from inferences
                </span>
              </div>

              <div className="space-y-2">
                {analysis.visualEvidence.map((ev, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white border border-slate-200 text-xs"
                  >
                    <span
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0 uppercase ${
                        ev.type === 'VISIBLE'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : ev.type === 'INFERRED'
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {ev.type}
                    </span>
                    <span className="text-slate-700 leading-snug">{ev.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Uncertainties (Responsible AI) */}
            {analysis.uncertainties && analysis.uncertainties.length > 0 && (
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-slate-700">
                  <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
                  <span>Documented Model Uncertainties</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-slate-600 text-[11px]">
                  {analysis.uncertainties.map((u, i) => (
                    <li key={i}>{u}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Suggested Tags */}
            <div className="flex flex-wrap items-center gap-1.5 pt-2">
              <span className="text-xs text-slate-400 mr-1 flex items-center gap-1">
                <Tag className="w-3 h-3" /> Tags:
              </span>
              {analysis.suggestedTags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-mono font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* AI Confirmation / Edit / Reanalyze Control Bar */}
            <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  id="confirm-analysis-button"
                  onClick={onConfirmAnalysis}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    classificationSource === 'AI_CONFIRMED'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Confirm Interpretation</span>
                </button>

                <button
                  type="button"
                  id="edit-analysis-button"
                  onClick={startEditing}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Edit Interpretation</span>
                </button>

                <button
                  type="button"
                  id="reanalyze-button"
                  onClick={onReanalyze}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center gap-1.5"
                  title="Re-run Gemini vision inspection on this photo"
                >
                  <RotateCw className="w-3.5 h-3.5 text-slate-500" />
                  <span>Reanalyze</span>
                </button>
              </div>

              <span className="text-[11px] text-slate-400 italic">
                “AI-generated analysis — verify before submission.”
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Inline Edit Modal / Drawer */}
      {isEditing && (
        <div className="p-4 border-2 border-indigo-200 rounded-xl bg-indigo-50/40 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-950 flex items-center gap-1.5">
              <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
              <span>Edit AI Classification (Audit Trail Maintained)</span>
            </span>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1 block">
                Primary Category
              </label>
              <select
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500"
              >
                {CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1 block">
                Severity Level
              </label>
              <select
                value={editSeverity}
                onChange={(e) => setEditSeverity(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500"
              >
                {SEVERITY_OPTIONS.map((sev) => (
                  <option key={sev} value={sev}>
                    {sev}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1 block">
              Factual Summary
            </label>
            <textarea
              rows={2}
              value={editSummary}
              onChange={(e) => setEditSummary(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1 block">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={editTags}
              onChange={(e) => setEditTags(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 bg-white border border-slate-300 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={saveEdits}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-2xs"
            >
              Apply Modifications
            </button>
          </div>
        </div>
      )}

      {/* Additional User Context Notes (stored strictly separate from visual evidence) */}
      <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
        <div className="flex items-center justify-between">
          <label
            htmlFor="user-context-notes"
            className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span>Additional Citizen Notes (Separate from Optical Evidence)</span>
          </label>
          <span className="text-[11px] text-slate-400">Optional</span>
        </div>
        <textarea
          id="user-context-notes"
          rows={2}
          value={userContextNotes}
          onChange={(e) => onUserContextChange(e.target.value)}
          placeholder="Add any personal observation, witness statement, or municipal crew contact details..."
          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      {/* Navigation Footer */}
      <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
        <button
          type="button"
          id="ai-step-back-button"
          onClick={onBack}
          className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Photo</span>
        </button>

        <button
          type="button"
          id="proceed-to-location-button"
          onClick={onProceedToLocation}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-2 transition-colors cursor-pointer"
        >
          <span>Continue to Location</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
