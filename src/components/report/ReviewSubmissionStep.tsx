import React, { useState } from 'react';
import {
  FileCheck,
  MapPin,
  Sparkles,
  History,
  Camera,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Tag,
  ShieldAlert,
  Loader2,
  Edit2,
} from 'lucide-react';
import {
  StructuredVisionAnalysis,
  ClassificationSource,
  MemoryCheckResult,
} from '../../types';
import { LocationData } from './LocationIntelligenceStep';

interface ReviewSubmissionStepProps {
  title: string;
  onTitleChange: (newTitle: string) => void;
  imagePreview: string | null;
  imageFile: { name: string; size: number; mimeType: string } | null;
  userDescription: string;
  userContextNotes: string;
  analysis: StructuredVisionAnalysis | null;
  classificationSource: ClassificationSource;
  location: LocationData;
  memoryResult: MemoryCheckResult;
  isSubmitting: boolean;
  onBack: () => void;
  onSubmit: () => void;
}

export const ReviewSubmissionStep: React.FC<ReviewSubmissionStepProps> = ({
  title,
  onTitleChange,
  imagePreview,
  imageFile,
  userDescription,
  userContextNotes,
  analysis,
  classificationSource,
  location,
  memoryResult,
  isSubmitting,
  onBack,
  onSubmit,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  return (
    <div className="space-y-6">
      {/* Title & Headline Card */}
      <div className="p-4 border border-slate-200 rounded-xl bg-white shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Incident Title
          </span>
          <button
            type="button"
            onClick={() => setIsEditingTitle((prev) => !prev)}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
          >
            <Edit2 className="w-3 h-3" />
            <span>{isEditingTitle ? 'Done' : 'Customize Title'}</span>
          </button>
        </div>

        {isEditingTitle ? (
          <input
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            className="w-full px-3 py-2 text-sm font-semibold text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        ) : (
          <h2 className="text-base font-bold text-slate-900 leading-snug">
            {title}
          </h2>
        )}

        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 text-xs">
          <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-800 font-semibold border border-indigo-200">
            {analysis?.primaryCategory || 'Infrastructure Defect'}
          </span>
          <span
            className={`px-2 py-0.5 rounded uppercase font-bold text-[10px] ${
              analysis?.severity === 'Critical'
                ? 'bg-rose-100 text-rose-800'
                : analysis?.severity === 'High'
                ? 'bg-amber-100 text-amber-800'
                : 'bg-blue-100 text-blue-800'
            }`}
          >
            {analysis?.severity || 'Medium'} Severity
          </span>
          {memoryResult.matches.length > 0 && (
            <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-100 font-mono text-[10px]">
              {memoryResult.matches.length} Linked Historical Records
            </span>
          )}
        </div>
      </div>

      {/* Grid of structured review cards with provenance badges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Photographic Evidence & User Context */}
        <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-slate-500" />
              <span>Evidence Photograph</span>
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-bold">
              USER REPORTED
            </span>
          </div>

          <div className="flex items-start gap-3">
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Evidence"
                className="w-20 h-20 rounded-lg object-cover border border-slate-200 shrink-0"
              />
            ) : (
              <div className="w-20 h-20 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 text-xs shrink-0">
                No Image
              </div>
            )}
            <div className="text-xs space-y-1 min-w-0">
              <p className="font-semibold text-slate-800 truncate">
                {imageFile?.name || 'incident_photo.jpg'}
              </p>
              {userDescription && (
                <p className="text-slate-600 italic line-clamp-3">
                  "{userDescription}"
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Card 2: AI Multimodal Vision Finding */}
        <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>AI Vision Interpretation</span>
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold">
              {classificationSource === 'USER_MODIFIED' ? 'USER MODIFIED' : 'AI GENERATED'}
            </span>
          </div>

          <p className="text-xs text-slate-700 leading-relaxed">
            {analysis?.summary || 'Defect characteristics logged for municipal verification.'}
          </p>

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
            <span>Confidence: {Math.round((analysis?.confidence || 0.8) * 100)}%</span>
            <span>{analysis?.visualEvidence.length || 0} optical markers</span>
          </div>
        </div>

        {/* Card 3: Location Anchor */}
        <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <span>Location Anchor</span>
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
              {location.source}
            </span>
          </div>

          <div className="text-xs space-y-0.5">
            <p className="font-semibold text-slate-900">{location.address}</p>
            <p className="text-slate-500">{location.zone}</p>
            <p className="font-mono text-[11px] text-slate-400 pt-1">
              {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
            </p>
          </div>
        </div>

        {/* Card 4: Infrastructure Memory Corroboration */}
        <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-slate-500" />
              <span>Infrastructure Memory</span>
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200 font-bold">
              SYSTEM DERIVED
            </span>
          </div>

          <div className="text-xs space-y-1">
            {memoryResult.matches.length > 0 ? (
              <>
                <p className="font-semibold text-slate-800">
                  {memoryResult.matches.length} connected historical failure(s) found
                </p>
                <p className="text-slate-500 text-[11px]">
                  Recurrence cycle: ~{memoryResult.typicalRecurrenceIntervalDays} days between patch and renewal.
                </p>
              </>
            ) : (
              <p className="text-slate-600">
                New baseline node. Establishes first spatial record at these coordinates.
              </p>
            )}

            {memoryResult.duplicateWarning && (
              <div className="flex items-center gap-1 text-amber-700 font-semibold text-[11px] mt-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>Active duplicate warning acknowledged by reporter</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Additional User Notes (if provided) */}
      {userContextNotes && (
        <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs space-y-1">
          <span className="font-bold uppercase tracking-wider text-slate-600 text-[10px]">
            Citizen Additional Testimony
          </span>
          <p className="text-slate-700">{userContextNotes}</p>
        </div>
      )}

      {/* Submission confirmation note */}
      <div className="p-3 bg-indigo-50/60 border border-indigo-200/60 rounded-xl text-xs text-indigo-900 flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
        <span>
          Submitting will register this complaint into CivicPulse persistent memory, link related incidents, update recurrence metrics, and notify municipal dispatch.
        </span>
      </div>

      {/* Footer Controls */}
      <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Memory Check</span>
        </button>

        <button
          type="button"
          id="btn-submit-incident"
          disabled={isSubmitting}
          onClick={onSubmit}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-2 transition-all cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Integrating into City Memory...</span>
            </>
          ) : (
            <>
              <FileCheck className="w-4 h-4" />
              <span>Submit to City Memory</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
