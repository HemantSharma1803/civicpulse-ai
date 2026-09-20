import React, { useRef, useState, useCallback } from 'react';
import {
  UploadCloud,
  Camera,
  Trash2,
  AlertTriangle,
  FileImage,
  ArrowRight,
  Sparkles,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { DEMO_SCENARIOS, DemoScenario } from '../../services/incidentReportingService';

interface SmartCaptureStepProps {
  imagePreview: string | null;
  imageFile: { name: string; size: number; mimeType: string } | null;
  userDescription: string;
  onImageSelected: (base64: string, fileMeta: { name: string; size: number; mimeType: string }) => void;
  onImageRemoved: () => void;
  onDescriptionChange: (text: string) => void;
  onSelectScenario: (scenario: DemoScenario) => void;
  onProceedToAi: () => void;
  onProceedManual: () => void;
}

export const SmartCaptureStep: React.FC<SmartCaptureStepProps> = ({
  imagePreview,
  imageFile,
  userDescription,
  onImageSelected,
  onImageRemoved,
  onDescriptionChange,
  onSelectScenario,
  onProceedToAi,
  onProceedManual,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [qualityWarning, setQualityWarning] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    (file: File) => {
      setFileError(null);
      setQualityWarning(null);

      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type.toLowerCase())) {
        setFileError(`Unsupported format "${file.type || 'unknown'}". Please upload a JPEG, PNG, or WebP photo.`);
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setFileError(`File size ${(file.size / (1024 * 1024)).toFixed(1)}MB exceeds the 10MB limit.`);
        return;
      }

      if (file.size < 12 * 1024) {
        setQualityWarning('Image file is very small (<12 KB). Resolution may limit AI optical evidence detection.');
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        onImageSelected(base64, {
          name: file.name,
          size: file.size,
          mimeType: file.type,
        });
      };
      reader.readAsDataURL(file);
    },
    [onImageSelected]
  );

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      {/* Hidden file inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            processFile(e.target.files[0]);
          }
        }}
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        id="report-file-input"
      />
      <input
        type="file"
        ref={cameraInputRef}
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            processFile(e.target.files[0]);
          }
        }}
        accept="image/*"
        capture="environment"
        className="hidden"
        id="report-camera-input"
      />

      {/* Demo Scenarios Quick Loader */}
      <div className="p-3.5 bg-slate-900 rounded-xl text-white border border-slate-800 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Interactive Test Scenarios
            </span>
          </div>
          <span className="text-[11px] text-slate-400">
            Click any scenario to test different memory & duplicate states
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-3">
          {DEMO_SCENARIOS.map((sc) => (
            <button
              key={sc.id}
              type="button"
              id={`preset-btn-${sc.id}`}
              onClick={() => onSelectScenario(sc)}
              className="group flex flex-col p-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 hover:border-indigo-500/50 text-left transition-all hover:shadow-md cursor-pointer"
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="text-[10px] font-mono uppercase font-bold text-indigo-300">
                  {sc.badge}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-300">
                  {sc.category}
                </span>
              </div>
              <p className="text-xs font-semibold text-white group-hover:text-indigo-200 line-clamp-1">
                {sc.label.split(':')[1]?.trim() || sc.label}
              </p>
              <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-snug">
                {sc.subtitle}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Upload & Capture Zone */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span>Photographic Evidence</span>
            <span className="text-xs font-normal text-slate-500">(Required for AI analysis)</span>
          </label>
          <span className="text-xs text-slate-500">Supports JPG, PNG, WebP (Max 10MB)</span>
        </div>

        {!imagePreview ? (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`border-2 border-dashed rounded-xl p-6 md:p-8 text-center transition-all ${
              isDragging
                ? 'border-indigo-500 bg-indigo-50/50 scale-[0.99]'
                : 'border-slate-300 hover:border-indigo-400 bg-slate-50/60'
            }`}
          >
            <div className="flex flex-col items-center max-w-md mx-auto">
              <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mb-3 shadow-xs">
                <UploadCloud className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">
                Drag & drop incident photo here
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                CivicPulse AI extracts visual defect markers, estimates severity, and flags uncertainties.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  id="browse-photo-button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <FileImage className="w-3.5 h-3.5" />
                  <span>Choose from Device</span>
                </button>

                <button
                  type="button"
                  id="capture-photo-button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5"
                >
                  <Camera className="w-3.5 h-3.5 text-slate-600" />
                  <span>Capture Photo</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Image Preview & Details Card */
          <div className="border border-slate-200 rounded-xl bg-white p-4 shadow-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                  <img
                    src={imagePreview}
                    alt="Captured Incident Evidence"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-1 left-1 px-1 py-0.5 rounded bg-slate-950/70 text-white text-[9px] font-mono">
                    RAW
                  </div>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-slate-900 truncate">
                      {imageFile?.name || 'incident_evidence.jpg'}
                    </span>
                    <span className="text-[11px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded font-mono">
                      {imageFile ? formatFileSize(imageFile.size) : 'Ready'}
                    </span>
                  </div>
                  <p className="text-xs text-emerald-600 font-medium mt-0.5 flex items-center gap-1">
                    <span>✓</span> Ready for Multimodal Gemini Vision
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    MIME: {imageFile?.mimeType || 'image/jpeg'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  type="button"
                  id="replace-photo-button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                >
                  Replace
                </button>
                <button
                  type="button"
                  id="remove-photo-button"
                  onClick={onImageRemoved}
                  className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                  title="Remove photo"
                  aria-label="Remove photo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error / Warning messaging */}
        {fileError && (
          <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{fileError}</span>
          </div>
        )}

        {qualityWarning && (
          <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-xs">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>{qualityWarning}</span>
          </div>
        )}
      </div>

      {/* Description Field */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label
            htmlFor="incident-description-input"
            className="text-sm font-bold text-slate-900 flex items-center gap-1.5"
          >
            <span>What did you notice?</span>
            <span className="text-xs font-normal text-slate-500">(Optional citizen testimony)</span>
          </label>
          <span className="text-xs font-mono text-slate-400">
            {userDescription.length}/600
          </span>
        </div>

        <textarea
          id="incident-description-input"
          value={userDescription}
          onChange={(e) => onDescriptionChange(e.target.value.slice(0, 600))}
          rows={3}
          placeholder="Describe anything that may not be obvious from the photo (e.g. 'water pools whenever it rains', 'was patched 2 weeks ago', 'dangerous at night')..."
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-slate-900 placeholder:text-slate-400 bg-white"
        />
        <p className="text-[11px] text-slate-500">
          User testimony will be presented to Gemini as contextual input, but never mixed into factual optical evidence.
        </p>
      </div>

      {/* Action Footer */}
      <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <button
          type="button"
          id="skip-ai-manual-button"
          onClick={onProceedManual}
          className="text-xs text-slate-500 hover:text-slate-800 underline font-medium"
        >
          Skip AI Vision & enter details manually
        </button>

        <button
          type="button"
          id="run-ai-vision-button"
          disabled={!imagePreview}
          onClick={onProceedToAi}
          className={`px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all shadow-xs ${
            imagePreview
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20 cursor-pointer'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          <Sparkles className="w-4 h-4 text-indigo-200" />
          <span>Run AI Vision Analysis</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
