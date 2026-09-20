import { Type, Schema } from '@google/genai';

export const ALLOWED_PRIMARY_CATEGORIES = [
  'Pothole',
  'Broken Streetlight',
  'Garbage Overflow',
  'Water Leakage',
  'Drainage Issue',
  'Damaged Footpath',
  'Traffic Signal Issue',
  'Other Civic Issue',
  'Unclear',
] as const;

export type PrimaryCategory = (typeof ALLOWED_PRIMARY_CATEGORIES)[number];

export const ALLOWED_SEVERITY_LEVELS = ['Low', 'Medium', 'High', 'Critical', 'Unclear'] as const;

export type SeverityLevel = (typeof ALLOWED_SEVERITY_LEVELS)[number];

export interface VisualEvidenceRaw {
  text: string;
  type: 'VISIBLE' | 'INFERRED' | 'UNCERTAIN';
}

export interface IncidentVisionOutput {
  isCivicIssue: boolean;
  primaryCategory: PrimaryCategory;
  secondaryCategory: string | null;
  severity: SeverityLevel;
  summary: string;
  visualEvidence: VisualEvidenceRaw[];
  estimatedImpact: string;
  confidence: number;
  uncertainties: string[];
  requiresHumanReview: boolean;
  suggestedTags: string[];
}

/**
 * Gemini responseSchema for structured JSON output
 */
export const incidentVisionResponseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    isCivicIssue: {
      type: Type.BOOLEAN,
      description: 'Whether the provided photo contains an observable civic infrastructure defect or municipal hazard.',
    },
    primaryCategory: {
      type: Type.STRING,
      enum: [
        'Pothole',
        'Broken Streetlight',
        'Garbage Overflow',
        'Water Leakage',
        'Drainage Issue',
        'Damaged Footpath',
        'Traffic Signal Issue',
        'Other Civic Issue',
        'Unclear',
      ],
      description: 'The primary classification of the municipal defect observed in the image.',
    },
    secondaryCategory: {
      type: Type.STRING,
      nullable: true,
      description: 'Secondary related category if composite failure (e.g., Water Leakage causing Road Damage), or null.',
    },
    severity: {
      type: Type.STRING,
      enum: ['Low', 'Medium', 'High', 'Critical', 'Unclear'],
      description: 'Estimated urgency based strictly on visible hazards to pedestrians or vehicular traffic.',
    },
    summary: {
      type: Type.STRING,
      description: 'Concise, objective summary of the visual defect without speculative embellishment.',
    },
    visualEvidence: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          text: {
            type: Type.STRING,
            description: 'Specific factual observation or note extracted from the photograph.',
          },
          type: {
            type: Type.STRING,
            enum: ['VISIBLE', 'INFERRED', 'UNCERTAIN'],
            description: 'Strict distinction between directly visible facts and inferred/uncertain factors.',
          },
        },
        required: ['text', 'type'],
      },
      description: 'Extracted visual evidence items categorized as VISIBLE, INFERRED, or UNCERTAIN.',
    },
    estimatedImpact: {
      type: Type.STRING,
      description: 'Potential inconvenience or safety consideration grounded purely in visible context.',
    },
    confidence: {
      type: Type.NUMBER,
      description: 'Statistical confidence score between 0.0 and 1.0 reflecting image clarity and category certainty.',
    },
    uncertainties: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Explicit list of what cannot be determined from this single 2D image (e.g. depth, subsurface condition).',
    },
    requiresHumanReview: {
      type: Type.BOOLEAN,
      description: 'True if image is blurry, ambiguous, or severity is marginal requiring municipal officer review.',
    },
    suggestedTags: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Normalized lowercase tags for classification and search indexing.',
    },
  },
  required: [
    'isCivicIssue',
    'primaryCategory',
    'severity',
    'summary',
    'visualEvidence',
    'estimatedImpact',
    'confidence',
    'uncertainties',
    'requiresHumanReview',
    'suggestedTags',
  ],
};
