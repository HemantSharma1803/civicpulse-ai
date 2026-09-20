import {
  IncidentCategory,
  StructuredVisionAnalysis,
  MemoryCheckResult,
  RelatedMatch,
} from '../types';
import { findRelatedIncidents } from './relationshipEngine';
import { dataService } from './dataService';

export interface VisionAnalysisResponse {
  success: boolean;
  analysis?: StructuredVisionAnalysis;
  error?: string;
  isAiGenerated: boolean;
  fallbackAvailable: boolean;
  modelUsed?: string;
}

export interface DemoScenario {
  id: string;
  label: string;
  badge: string;
  subtitle: string;
  category: IncidentCategory;
  address: string;
  zone: string;
  latitude: number;
  longitude: number;
  description: string;
  imageThumbnail: string;
  expectedMemoryOutcome: 'isolated' | 'historical_failure' | 'likely_duplicate' | 'chronic_hotspot';
  scenarioNotes: string;
}

// Curated demo scenario presets
export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 'scenario-a',
    label: 'Scenario A: New Isolated Pothole',
    badge: 'Isolated Baseline',
    subtitle: 'Sector 3 Malviya Nagar — No prior record exists at these coordinates.',
    category: 'Pothole',
    address: 'Near Central Spine Market, Sector 3, Malviya Nagar',
    zone: 'South Zone',
    latitude: 26.8520,
    longitude: 75.8210,
    description: 'Fresh bitumen cavity forming after evening supply truck traffic. Edge crumbling visible near stormwater curb.',
    imageThumbnail: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80',
    expectedMemoryOutcome: 'isolated',
    scenarioNotes: 'Tests first-time incident recording. CivicPulse memory will confirm this is a new infrastructure baseline.',
  },
  {
    id: 'scenario-b',
    label: 'Scenario B: Recurring Failure at Tonk Flyover',
    badge: 'Chronic Lineage',
    subtitle: 'Pillar 14, Tonk Road — Location with 3 prior failures and a failed repair event.',
    category: 'Pothole',
    address: 'Pillar 14, Under Tonk Road Elevated Flyover',
    zone: 'Central-South Corridor',
    latitude: 26.8795,
    longitude: 75.8015,
    description: 'Deep road surface crater re-opened at exact spot where cold-mix bitumen was laid 22 days ago. Subsurface dampness apparent.',
    imageThumbnail: 'https://images.unsplash.com/photo-1598555230916-24e6451e0413?w=600&auto=format&fit=crop&q=80',
    expectedMemoryOutcome: 'historical_failure',
    scenarioNotes: 'Tests failure lineage. CivicPulse will connect INC-1048, INC-1018, INC-1002, and failed patch repair REP-401.',
  },
  {
    id: 'scenario-c',
    label: 'Scenario C: Potential Duplicate Report',
    badge: 'Duplicate Warning',
    subtitle: 'JL Marg near Commerce College — 48m from active unassigned complaint INC-1002.',
    category: 'Pothole',
    address: 'Opposite University Commerce College, JLN Marg',
    zone: 'East Zone',
    latitude: 26.8845,
    longitude: 75.8118,
    description: 'Large surface cavity in the middle carriage lane. Vehicles forced to brake abruptly during peak traffic hours.',
    imageThumbnail: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=600&auto=format&fit=crop&q=80',
    expectedMemoryOutcome: 'likely_duplicate',
    scenarioNotes: 'Tests duplicate mitigation. CivicPulse flags an active ticket from 4 days ago, offering "View Existing" or "Report as New".',
  },
  {
    id: 'scenario-d',
    label: 'Scenario D: Chronic Catchment Drainage Hotspot',
    badge: 'Hotspot Cluster',
    subtitle: 'Ajmeri Gate, MI Road — Hotspot HOT-02 with 5 historical failure cycles.',
    category: 'Drainage Issue',
    address: 'Near Old Post Office, Ajmeri Gate, MI Road',
    zone: 'Walled City Zone',
    latitude: 26.9180,
    longitude: 75.8185,
    description: 'Stormwater grate blocked by silt and commercial refuse. Wastewater regurgitating onto pedestrian walkway and shop fronts.',
    imageThumbnail: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?w=600&auto=format&fit=crop&q=80',
    expectedMemoryOutcome: 'chronic_hotspot',
    scenarioNotes: 'Tests chronic hotspot linkage. CivicPulse recognizes the 22-day recurrence cycle and links to Walled City flood history.',
  },
];

/**
 * Sends image and user context to the backend Gemini vision service
 */
export async function analyzeIncidentImageWithAI(
  imageBase64: string,
  mimeType: string,
  userDescription?: string
): Promise<VisionAnalysisResponse> {
  try {
    const response = await fetch('/api/ai/analyze-incident', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageBase64,
        mimeType,
        userDescription,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.analysis) {
        return {
          success: true,
          analysis: {
            ...data.analysis,
            analyzedAt: new Date().toISOString(),
            model: data.modelUsed || 'gemini-3.8-flash',
          },
          isAiGenerated: true,
          fallbackAvailable: true,
          modelUsed: data.modelUsed,
        };
      }
      // If backend returned success: false with fallbackAvailable
      return {
        success: false,
        error: data.error || 'AI Vision analysis could not parse the photo.',
        isAiGenerated: false,
        fallbackAvailable: true,
      };
    }

    const errData = await response.json().catch(() => ({}));
    return {
      success: false,
      error: errData.error || `Server responded with status ${response.status}`,
      isAiGenerated: false,
      fallbackAvailable: true,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.warn('[CivicPulse Frontend] Backend vision call failed, providing fallback path:', errorMsg);

    return {
      success: false,
      error: 'Network connection to AI Vision service was interrupted. Manual inspection is available.',
      isAiGenerated: false,
      fallbackAvailable: true,
    };
  }
}

/**
 * Intelligent client-side fallback heuristic when Gemini API key is missing or offline
 * Ensures the application is fully functional and gracefully falls back with explicit transparency.
 */
export function generateManualFallbackAnalysis(
  userDescription?: string,
  suggestedCategory?: IncidentCategory
): StructuredVisionAnalysis {
  const descLower = (userDescription || '').toLowerCase();

  let category: IncidentCategory = suggestedCategory || 'Pothole';
  if (descLower.includes('light') || descLower.includes('lamp') || descLower.includes('dark')) {
    category = 'Broken Streetlight';
  } else if (descLower.includes('garbage') || descLower.includes('waste') || descLower.includes('trash')) {
    category = 'Garbage Overflow';
  } else if (descLower.includes('water') || descLower.includes('pipe') || descLower.includes('leak')) {
    category = 'Water Leakage';
  } else if (descLower.includes('drain') || descLower.includes('gutter') || descLower.includes('sewer')) {
    category = 'Drainage Issue';
  } else if (descLower.includes('footpath') || descLower.includes('sidewalk') || descLower.includes('pavement')) {
    category = 'Damaged Footpath';
  } else if (descLower.includes('signal') || descLower.includes('traffic')) {
    category = 'Traffic Signal Issue';
  }

  return {
    isCivicIssue: true,
    primaryCategory: category,
    secondaryCategory: null,
    severity: 'Medium',
    summary: userDescription?.trim()
      ? `Reported ${category.toLowerCase()} logged for manual field verification.`
      : `Visible ${category.toLowerCase()} surface defect awaiting officer classification.`,
    visualEvidence: [
      {
        text: 'Photograph submitted by user with manual defect tag.',
        type: 'VISIBLE',
      },
      {
        text: 'Automated AI multimodal vision service was unconfigured or bypassed.',
        type: 'UNCERTAIN',
      },
    ],
    estimatedImpact: 'Municipal crew inspection recommended to verify physical extent.',
    confidence: 0.75,
    uncertainties: [
      'Visual attributes verified via citizen report rather than automated Gemini model.',
      'Exact physical dimensions require manual ground-truthing.',
    ],
    requiresHumanReview: true,
    suggestedTags: [category.toLowerCase().replace(/\s+/g, '-'), 'manual-review'],
    analyzedAt: new Date().toISOString(),
    model: 'Manual Heuristic Fallback',
  };
}

/**
 * Executes multi-signal CivicPulse memory search for related incidents and chronic history
 */
export function executeMemoryCheck(
  latitude: number,
  longitude: number,
  category: IncidentCategory | string,
  title?: string,
  description?: string,
  excludeIncidentId?: string
): MemoryCheckResult {
  const incidents = dataService.getIncidents();
  const hotspots = dataService.getHotspots();

  return findRelatedIncidents(
    {
      latitude,
      longitude,
      category,
      title,
      description,
      excludeIncidentId,
    },
    incidents,
    hotspots
  );
}

/**
 * Generates an objective, deterministic title for an incident based on category, location, and recurrence
 */
export function generateIncidentTitle(
  category: IncidentCategory | string,
  address: string,
  relatedMatches: RelatedMatch[] = []
): string {
  const hasHistory = relatedMatches.some((m) => m.relationType === 'HISTORICAL_RELATED');
  const isDuplicate = relatedMatches.some((m) => m.relationType === 'LIKELY_DUPLICATE');

  // Extract short street or landmark name from address
  const parts = address.split(',').map((p) => p.trim());
  const landmark = parts[0] || 'Municipal Area';

  if (isDuplicate) {
    return `Potential Duplicate: ${category} — ${landmark}`;
  }

  if (hasHistory) {
    return `Recurring ${category} — ${landmark}`;
  }

  return `${category} — ${landmark}`;
}
