import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Camera,
  Eye,
  MapPin,
  History,
  FileCheck,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  RotateCcw,
  Save,
} from 'lucide-react';
import { useCivicPulse } from '../context/CivicPulseContext';
import {
  StructuredVisionAnalysis,
  ClassificationSource,
  MemoryCheckResult,
  Incident,
  IncidentCategory,
} from '../types';
import { ReportStepper, ReportStepId } from '../components/report/ReportStepper';
import { SmartCaptureStep } from '../components/report/SmartCaptureStep';
import { AiVisionStep } from '../components/report/AiVisionStep';
import {
  LocationIntelligenceStep,
  LocationData,
} from '../components/report/LocationIntelligenceStep';
import { MemoryCheckStep } from '../components/report/MemoryCheckStep';
import { ReviewSubmissionStep } from '../components/report/ReviewSubmissionStep';
import { SubmissionSuccessStep } from '../components/report/SubmissionSuccessStep';
import {
  analyzeIncidentImageWithAI,
  generateManualFallbackAnalysis,
  executeMemoryCheck,
  generateIncidentTitle,
  DemoScenario,
} from '../services/incidentReportingService';

const DRAFT_STORAGE_KEY = 'civicpulse_report_draft_v2';

export const ReportIncidentView: React.FC = () => {
  const { reportIncident, setSelectedIncidentId, setCurrentPage } = useCivicPulse();

  // Stepper State
  const [currentStep, setCurrentStep] = useState<ReportStepId>(1);
  const [maxStepReached, setMaxStepReached] = useState<ReportStepId>(1);

  // Step 1: Capture State
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<{ name: string; size: number; mimeType: string } | null>(null);
  const [userDescription, setUserDescription] = useState<string>('');

  // Step 2: AI Vision State
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysis, setAnalysis] = useState<StructuredVisionAnalysis | null>(null);
  const [analysisVersion, setAnalysisVersion] = useState<number>(1);
  const [classificationSource, setClassificationSource] = useState<ClassificationSource>('AI_CONFIRMED');
  const [userContextNotes, setUserContextNotes] = useState<string>('');
  const [aiErrorMessage, setAiErrorMessage] = useState<string | null>(null);

  // Step 3: Location State
  const [location, setLocation] = useState<LocationData>({
    address: 'Pillar 14, Under Tonk Road Elevated Flyover, Jaipur',
    zone: 'Central-South Corridor',
    latitude: 26.8795,
    longitude: 75.8015,
    source: 'DEMO-SELECTED',
  });

  // Step 4: Memory Check Result
  const [memoryResult, setMemoryResult] = useState<MemoryCheckResult>({
    matches: [],
    duplicateWarning: false,
    likelyDuplicateMatch: null,
    chronicHotspot: null,
    locationHistorySummary: '',
    hasLocationHistory: false,
  });

  // Step 5: Review & Title
  const [incidentTitle, setIncidentTitle] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Step 6: Submitted Incident
  const [createdIncident, setCreatedIncident] = useState<Incident | null>(null);

  // Autosave status indicator
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);

  // Load draft from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        const draft = JSON.parse(saved);
        if (draft.userDescription) setUserDescription(draft.userDescription);
        if (draft.userContextNotes) setUserContextNotes(draft.userContextNotes);
        if (draft.location) setLocation(draft.location);
        if (draft.analysis) setAnalysis(draft.analysis);
      }
    } catch {
      // ignore
    }
  }, []);

  // Autosave draft to localStorage
  useEffect(() => {
    if (currentStep === 6) return; // do not autosave completed state
    try {
      const draft = {
        userDescription,
        userContextNotes,
        location,
        analysis,
        timestamp: Date.now(),
      };
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
      setLastSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } catch {
      // ignore
    }
  }, [userDescription, userContextNotes, location, analysis, currentStep]);

  // Navigate to step with boundary checks
  const goToStep = (step: ReportStepId) => {
    setCurrentStep(step);
    if (step > maxStepReached) {
      setMaxStepReached(step);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- Step 1 Handlers ---
  const handleImageSelected = (
    base64: string,
    fileMeta: { name: string; size: number; mimeType: string }
  ) => {
    setImagePreview(base64);
    setImageFile(fileMeta);
  };

  const handleImageRemoved = () => {
    setImagePreview(null);
    setImageFile(null);
    setAnalysis(null);
  };

  const handleSelectScenario = (scenario: DemoScenario) => {
    setImagePreview(scenario.imageThumbnail);
    setImageFile({
      name: `${scenario.id}_sample.jpg`,
      size: 340 * 1024,
      mimeType: 'image/jpeg',
    });
    setUserDescription(scenario.description);
    setLocation({
      address: scenario.address,
      zone: scenario.zone,
      latitude: scenario.latitude,
      longitude: scenario.longitude,
      source: 'DEMO-SELECTED',
    });

    // Create preliminary structured analysis for instant responsiveness
    const preliminaryAnalysis = generateManualFallbackAnalysis(
      scenario.description,
      scenario.category
    );
    setAnalysis(preliminaryAnalysis);
    setClassificationSource('AI_CONFIRMED');
    goToStep(2);
  };

  // Run AI Vision
  const runAiAnalysis = async () => {
    if (!imagePreview) return;

    goToStep(2);
    setIsAnalyzing(true);
    setAiErrorMessage(null);

    const base64Data = imagePreview.includes(',')
      ? imagePreview.split(',')[1]
      : imagePreview;
    const mime = imageFile?.mimeType || 'image/jpeg';

    const result = await analyzeIncidentImageWithAI(base64Data, mime, userDescription);
    setIsAnalyzing(false);

    if (result.success && result.analysis) {
      setAnalysis(result.analysis);
      setClassificationSource('AI_CONFIRMED');
      setAiErrorMessage(null);
    } else {
      setAiErrorMessage(result.error || 'AI multimodal analysis could not process the photo.');
      const fallback = generateManualFallbackAnalysis(userDescription);
      setAnalysis(fallback);
      setClassificationSource('USER_SUPPLIED');
    }
  };

  const handleProceedManual = () => {
    const fallback = generateManualFallbackAnalysis(userDescription);
    setAnalysis(fallback);
    setClassificationSource('USER_SUPPLIED');
    goToStep(2);
  };

  // --- Step 2 Handlers ---
  const handleConfirmAnalysis = () => {
    setClassificationSource('AI_CONFIRMED');
  };

  const handleUpdateAnalysis = (updated: StructuredVisionAnalysis) => {
    setAnalysis(updated);
    setClassificationSource('USER_MODIFIED');
  };

  const handleReanalyze = async () => {
    setAnalysisVersion((v) => v + 1);
    await runAiAnalysis();
  };

  // --- Step 3 Handlers ---
  const handleProceedToMemoryCheck = () => {
    const cat = analysis?.primaryCategory || 'Pothole';
    const result = executeMemoryCheck(
      location.latitude,
      location.longitude,
      cat,
      userDescription,
      userDescription
    );
    setMemoryResult(result);

    // Auto-generate title based on memory findings
    const genTitle = generateIncidentTitle(cat, location.address, result.matches);
    setIncidentTitle(genTitle);

    goToStep(4);
  };

  // --- Step 4 Handlers ---
  const handleSelectExistingIncident = (id: string) => {
    setSelectedIncidentId(id);
  };

  const handleCancelReport = () => {
    if (confirm('Cancel this incident report and start over?')) {
      handleResetForm();
    }
  };

  // --- Step 5 Submission Handler ---
  const handleSubmitIncident = () => {
    setIsSubmitting(true);

    setTimeout(() => {
      const cat = (analysis?.primaryCategory || 'Pothole') as IncidentCategory;
      const sev = (analysis?.severity?.toLowerCase() || 'medium') as Incident['severity'];

      const relatedIds = memoryResult.matches.map((m) => m.incidentId);

      const created = reportIncident({
        title: incidentTitle || `${cat} at ${location.address}`,
        description: userDescription || analysis?.summary || 'Infrastructure defect logged.',
        category: cat,
        severity: sev,
        status: 'active',
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address,
        zone: location.zone,
        source: 'Citizen Report',
        tags: analysis?.suggestedTags || [cat.toLowerCase()],
        imageUrl: imagePreview,
        aiAnalysis: {
          category: cat,
          severity: sev,
          summary: analysis?.summary,
          confidence: analysis?.confidence,
          requiresHumanReview: analysis?.requiresHumanReview,
          model: analysis?.model,
          createdAt: new Date().toISOString(),
          structured: analysis || undefined,
        },
        aiVisionAnalysis: analysis,
        relatedIncidentIds: relatedIds,
        recurrenceCount: relatedIds.length,
        repairEventIds: [],
        classificationSource,
        analysisVersion,
        userContext: userContextNotes || undefined,
      });

      // Clear draft storage
      try {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      } catch {
        // ignore
      }

      setCreatedIncident(created);
      setIsSubmitting(false);
      goToStep(6);
    }, 700);
  };

  // Reset form
  const handleResetForm = () => {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {
      // ignore
    }
    setImagePreview(null);
    setImageFile(null);
    setUserDescription('');
    setAnalysis(null);
    setAnalysisVersion(1);
    setClassificationSource('AI_CONFIRMED');
    setUserContextNotes('');
    setCreatedIncident(null);
    setCurrentStep(1);
    setMaxStepReached(1);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-wider border border-indigo-200">
              Multimodal Intake Engine
            </span>
            {lastSavedTime && currentStep !== 6 && (
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Save className="w-3 h-3 text-slate-400" />
                Draft saved {lastSavedTime}
              </span>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            REPORT AN INFRASTRUCTURE ISSUE
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 italic">
            “Give CivicPulse one photo. We’ll help turn it into structured city intelligence.”
          </p>
        </div>

        {currentStep !== 6 && (
          <button
            type="button"
            onClick={handleResetForm}
            className="self-start sm:self-center px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1"
            title="Reset draft and start a new report"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Draft</span>
          </button>
        )}
      </div>

      {/* 6-Step Stepper Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
        <ReportStepper
          currentStep={currentStep}
          maxStepReached={maxStepReached}
          onStepClick={goToStep}
        />
      </div>

      {/* Step Views Content */}
      <div>
        {currentStep === 1 && (
          <SmartCaptureStep
            imagePreview={imagePreview}
            imageFile={imageFile}
            userDescription={userDescription}
            onImageSelected={handleImageSelected}
            onImageRemoved={handleImageRemoved}
            onDescriptionChange={setUserDescription}
            onSelectScenario={handleSelectScenario}
            onProceedToAi={runAiAnalysis}
            onProceedManual={handleProceedManual}
          />
        )}

        {currentStep === 2 && (
          <AiVisionStep
            isAnalyzing={isAnalyzing}
            analysis={analysis}
            analysisVersion={analysisVersion}
            classificationSource={classificationSource}
            userContextNotes={userContextNotes}
            errorMessage={aiErrorMessage}
            onConfirmAnalysis={handleConfirmAnalysis}
            onUpdateAnalysis={handleUpdateAnalysis}
            onReanalyze={handleReanalyze}
            onUserContextChange={setUserContextNotes}
            onBack={() => goToStep(1)}
            onProceedToLocation={() => goToStep(3)}
          />
        )}

        {currentStep === 3 && (
          <LocationIntelligenceStep
            location={location}
            onLocationChange={setLocation}
            onBack={() => goToStep(2)}
            onProceedToMemoryCheck={handleProceedToMemoryCheck}
          />
        )}

        {currentStep === 4 && (
          <MemoryCheckStep
            memoryResult={memoryResult}
            onSelectExistingIncident={handleSelectExistingIncident}
            onCancelReport={handleCancelReport}
            onBack={() => goToStep(3)}
            onProceedToReview={() => goToStep(5)}
          />
        )}

        {currentStep === 5 && (
          <ReviewSubmissionStep
            title={incidentTitle}
            onTitleChange={setIncidentTitle}
            imagePreview={imagePreview}
            imageFile={imageFile}
            userDescription={userDescription}
            userContextNotes={userContextNotes}
            analysis={analysis}
            classificationSource={classificationSource}
            location={location}
            memoryResult={memoryResult}
            isSubmitting={isSubmitting}
            onBack={() => goToStep(4)}
            onSubmit={handleSubmitIncident}
          />
        )}

        {currentStep === 6 && createdIncident && (
          <SubmissionSuccessStep
            createdIncident={createdIncident}
            onViewIncident={(id) => setSelectedIncidentId(id)}
            onViewFailureMemory={() => setCurrentPage('failure-memory')}
            onGoToCityIntelligence={() => setCurrentPage('city-intelligence')}
            onReportAnother={handleResetForm}
          />
        )}
      </div>
    </div>
  );
};
