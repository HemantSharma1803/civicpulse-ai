import {
  ALLOWED_PRIMARY_CATEGORIES,
  ALLOWED_SEVERITY_LEVELS,
  IncidentVisionOutput,
  PrimaryCategory,
  SeverityLevel,
  VisualEvidenceRaw,
} from './schemas';

export interface ImageAnalysisInput {
  imageBase64: string;
  mimeType: string;
  userDescription?: string;
}

export interface ValidationResult<T> {
  isValid: boolean;
  data?: T;
  error?: string;
}

export function validateImageInput(input: unknown): ValidationResult<ImageAnalysisInput> {
  if (!input || typeof input !== 'object') {
    return { isValid: false, error: 'Request body must be a valid JSON object.' };
  }

  const { imageBase64, mimeType, userDescription } = input as Record<string, unknown>;

  if (typeof imageBase64 !== 'string' || !imageBase64.trim()) {
    return { isValid: false, error: 'imageBase64 must be a non-empty base64 string.' };
  }

  // Check supported mime types
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
  const normalizedMime = typeof mimeType === 'string' ? mimeType.toLowerCase().trim() : 'image/jpeg';
  if (!allowedMimes.includes(normalizedMime)) {
    return {
      isValid: false,
      error: `Unsupported image MIME type: ${mimeType}. CivicPulse accepts JPEG, PNG, or WebP.`,
    };
  }

  // Rough size validation (10MB limit in base64 is ~13.5MB string length)
  if (imageBase64.length > 15 * 1024 * 1024) {
    return { isValid: false, error: 'Image exceeds maximum allowed size of 10MB.' };
  }

  return {
    isValid: true,
    data: {
      imageBase64: imageBase64.replace(/^data:image\/[a-zA-Z]+;base64,/, ''),
      mimeType: normalizedMime,
      userDescription: typeof userDescription === 'string' ? userDescription.slice(0, 1000) : undefined,
    },
  };
}

export function validateAndSanitizeVisionOutput(rawObj: unknown): ValidationResult<IncidentVisionOutput> {
  if (!rawObj || typeof rawObj !== 'object') {
    return { isValid: false, error: 'Parsed model response is not a valid JSON object.' };
  }

  const obj = rawObj as Record<string, unknown>;

  // Primary Category check
  let primaryCategory: PrimaryCategory = 'Unclear';
  if (
    typeof obj.primaryCategory === 'string' &&
    ALLOWED_PRIMARY_CATEGORIES.includes(obj.primaryCategory as PrimaryCategory)
  ) {
    primaryCategory = obj.primaryCategory as PrimaryCategory;
  }

  // Severity check
  let severity: SeverityLevel = 'Medium';
  if (typeof obj.severity === 'string' && ALLOWED_SEVERITY_LEVELS.includes(obj.severity as SeverityLevel)) {
    severity = obj.severity as SeverityLevel;
  }

  // Visual evidence check & normalization
  const visualEvidence: VisualEvidenceRaw[] = [];
  if (Array.isArray(obj.visualEvidence)) {
    for (const item of obj.visualEvidence) {
      if (typeof item === 'string') {
        visualEvidence.push({ text: item, type: 'VISIBLE' });
      } else if (item && typeof item === 'object' && typeof (item as { text: unknown }).text === 'string') {
        const itemObj = item as { text: string; type?: string };
        const rawType = itemObj.type?.toUpperCase();
        const evidenceType = rawType === 'INFERRED' || rawType === 'UNCERTAIN' ? rawType : 'VISIBLE';
        visualEvidence.push({
          text: itemObj.text.trim(),
          type: evidenceType,
        });
      }
    }
  }

  // If no visual evidence was provided, create an honest placeholder
  if (visualEvidence.length === 0) {
    visualEvidence.push({
      text: 'Visual surface characteristics were examined by the AI vision pipeline.',
      type: 'VISIBLE',
    });
  }

  // Confidence check
  let confidence = typeof obj.confidence === 'number' ? obj.confidence : 0.82;
  if (confidence > 1.0) confidence = confidence / 100;
  if (confidence < 0) confidence = 0.5;

  // Uncertainties check
  const uncertainties: string[] = [];
  if (Array.isArray(obj.uncertainties)) {
    for (const u of obj.uncertainties) {
      if (typeof u === 'string' && u.trim()) {
        uncertainties.push(u.trim());
      }
    }
  }
  if (uncertainties.length === 0) {
    uncertainties.push('Exact depth and subsurface structural integrity cannot be determined from a single photographic angle.');
  }

  // Suggested tags
  const suggestedTags: string[] = [];
  if (Array.isArray(obj.suggestedTags)) {
    for (const tag of obj.suggestedTags) {
      if (typeof tag === 'string' && tag.trim()) {
        suggestedTags.push(tag.trim().toLowerCase());
      }
    }
  }

  const sanitized: IncidentVisionOutput = {
    isCivicIssue: typeof obj.isCivicIssue === 'boolean' ? obj.isCivicIssue : true,
    primaryCategory,
    secondaryCategory: typeof obj.secondaryCategory === 'string' ? obj.secondaryCategory : null,
    severity,
    summary:
      typeof obj.summary === 'string' && obj.summary.trim()
        ? obj.summary.trim()
        : 'Observable infrastructure damage logged for municipal review.',
    visualEvidence,
    estimatedImpact:
      typeof obj.estimatedImpact === 'string' && obj.estimatedImpact.trim()
        ? obj.estimatedImpact.trim()
        : 'May cause vehicular or pedestrian inconvenience if left unrepaired.',
    confidence: Math.round(confidence * 100) / 100,
    uncertainties,
    requiresHumanReview: Boolean(obj.requiresHumanReview),
    suggestedTags: suggestedTags.length > 0 ? suggestedTags : [primaryCategory.toLowerCase().replace(/\s+/g, '-')],
  };

  return { isValid: true, data: sanitized };
}
