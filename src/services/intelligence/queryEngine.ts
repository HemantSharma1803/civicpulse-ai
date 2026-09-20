import { Incident, Hotspot, IncidentCategory, IncidentSeverity } from '../../types';
import { AskCivicPulseQuery } from './types';

export interface PrebuiltQueryPrompt {
  id: string;
  label: string;
  query: string;
  categoryTag?: string;
  badge: string;
}

export const SUGGESTED_QUERIES: PrebuiltQueryPrompt[] = [
  {
    id: 'sq-1',
    label: 'Tonk Road Pothole Recurrence',
    query: 'Which corridors have recurring potholes and why are cold patches failing?',
    categoryTag: 'Pothole',
    badge: 'Critical Corridor',
  },
  {
    id: 'sq-2',
    label: 'West Zone Signal Failures',
    query: 'What is causing the West Zone traffic light controller issues at Gopalpura Bypass?',
    categoryTag: 'Traffic Signal Issue',
    badge: 'Hardware Anomaly',
  },
  {
    id: 'sq-3',
    label: 'Monsoon Rain Cascades',
    query: 'Show me incidents where water leakage or drainage choke worsened road pavement integrity.',
    categoryTag: 'Drainage Issue',
    badge: 'Cross-Department',
  },
  {
    id: 'sq-4',
    label: 'Zone Recurrence Comparison',
    query: 'Compare South Zone vs West Zone recurrence rates and critical hotspot counts.',
    badge: 'Comparative Audit',
  },
  {
    id: 'sq-5',
    label: 'Repair Durability Audit',
    query: 'Are municipal repairs holding up? What is our average patch failure interval?',
    badge: 'Asset Longevity',
  },
  {
    id: 'sq-6',
    label: 'North Zone Telemetry Blind Spot',
    query: 'What data quality gaps or under-reporting issues exist across city districts?',
    badge: 'Data Governance',
  },
];

export class QueryEngine {
  /**
   * Interpret a natural language question and generate an evidence-grounded response.
   */
  public async executeQuery(
    queryText: string,
    allIncidents: Incident[],
    allHotspots: Hotspot[]
  ): Promise<AskCivicPulseQuery> {
    const qLower = queryText.toLowerCase();

    // 1. Deterministic Intent & Filter Extraction
    const { category, zone, severity, isRecurrenceFocus, keywords, intent, summary } =
      this.extractFilters(qLower);

    // 2. Deterministic Incident & Hotspot Filtering
    let matchedIncidents = allIncidents.filter((inc) => {
      if (category && category !== 'all' && inc.category !== category) return false;
      if (zone && zone !== 'all' && !inc.zone.toLowerCase().includes(zone.toLowerCase())) return false;
      if (severity && severity !== 'all' && inc.severity !== severity) return false;
      if (isRecurrenceFocus && inc.recurrenceCount === 0) return false;
      return true;
    });

    // If keywords exist, refine matches or rank them
    if (keywords.length > 0) {
      const keywordFiltered = matchedIncidents.filter((inc) =>
        keywords.some(
          (kw) =>
            inc.title.toLowerCase().includes(kw) ||
            inc.description.toLowerCase().includes(kw) ||
            inc.address.toLowerCase().includes(kw)
        )
      );
      if (keywordFiltered.length > 0) {
        matchedIncidents = keywordFiltered;
      }
    }

    // Fallback if filter too narrow: ensure we have relevant contextual incidents
    if (matchedIncidents.length === 0) {
      matchedIncidents = allIncidents.slice(0, 5);
    }

    const matchedHotspots = allHotspots.filter((h) => {
      if (category && category !== 'all' && h.dominantCategory !== category) return false;
      if (zone && zone !== 'all' && !h.zone.toLowerCase().includes(zone.toLowerCase())) return false;
      return true;
    });

    const matchedIncidentIds = matchedIncidents.map((i) => i.id);
    const matchedHotspotIds = matchedHotspots.map((h) => h.id);

    // 3. AI Server Request with Deterministic Fallback
    let answer = await this.tryServerGeminiAsk(queryText, {
      matchedCount: matchedIncidents.length,
      category: category || 'all',
      zone: zone || 'all',
      isRecurrence: isRecurrenceFocus,
      sampleIncidentIds: matchedIncidentIds.slice(0, 5),
      hotspots: matchedHotspots.map((h) => h.locationName),
    });

    if (!answer) {
      answer = this.generateDeterministicAnswer(
        queryText,
        intent,
        matchedIncidents,
        matchedHotspots,
        category,
        zone
      );
    }

    return {
      id: `QRY-${Date.now()}`,
      query: queryText,
      timestamp: new Date().toISOString(),
      interpretedIntent: {
        category,
        zone,
        severity,
        isRecurrenceFocus,
        keywords,
        summary,
      },
      matchedIncidentIds,
      matchedHotspotIds,
      answer,
    };
  }

  private extractFilters(q: string): {
    category?: IncidentCategory | 'all';
    zone?: string | 'all';
    severity?: IncidentSeverity | 'all';
    isRecurrenceFocus: boolean;
    keywords: string[];
    intent: 'corridor_analysis' | 'root_cause' | 'comparison' | 'repair_durability' | 'general_search';
    summary: string;
  } {
    let category: IncidentCategory | 'all' = 'all';
    if (q.includes('pothole') || q.includes('road') || q.includes('asphalt') || q.includes('bitumen')) {
      category = 'Pothole';
    } else if (q.includes('light') || q.includes('lamp') || q.includes('illumination')) {
      category = 'Broken Streetlight';
    } else if (q.includes('garbage') || q.includes('waste') || q.includes('refuse') || q.includes('bin')) {
      category = 'Garbage Overflow';
    } else if (q.includes('water') || q.includes('leak') || q.includes('pipe') || q.includes('burst')) {
      category = 'Water Leakage';
    } else if (q.includes('drain') || q.includes('culvert') || q.includes('flood') || q.includes('choke')) {
      category = 'Drainage Issue';
    } else if (q.includes('footpath') || q.includes('sidewalk') || q.includes('paver') || q.includes('pedestrian')) {
      category = 'Damaged Footpath';
    } else if (q.includes('signal') || q.includes('traffic light') || q.includes('controller') || q.includes('junction')) {
      category = 'Traffic Signal Issue';
    }

    let zone: string | 'all' = 'all';
    if (q.includes('south') || q.includes('tonk') || q.includes('jawahar')) {
      zone = 'South Zone';
    } else if (q.includes('west') || q.includes('gopalpura')) {
      zone = 'West Zone';
    } else if (q.includes('north') || q.includes('mi avenue')) {
      zone = 'North Zone';
    } else if (q.includes('east') || q.includes('bapu nagar')) {
      zone = 'East Zone';
    } else if (q.includes('central')) {
      zone = 'Central-West Zone';
    }

    let severity: IncidentSeverity | 'all' = 'all';
    if (q.includes('critical') || q.includes('severe') || q.includes('urgent')) {
      severity = 'critical';
    } else if (q.includes('high')) {
      severity = 'high';
    }

    const isRecurrenceFocus =
      q.includes('recur') ||
      q.includes('repeat') ||
      q.includes('again') ||
      q.includes('fail') ||
      q.includes('chronic') ||
      q.includes('hotspot');

    const keywords: string[] = [];
    if (q.includes('rain') || q.includes('monsoon')) keywords.push('monsoon', 'rain', 'storm');
    if (q.includes('surge') || q.includes('electric') || q.includes('voltage')) keywords.push('surge', 'electrical');
    if (q.includes('patch') || q.includes('cold mix')) keywords.push('patch', 'bitumen');
    if (q.includes('culvert') || q.includes('silt')) keywords.push('culvert', 'silt');
    if (q.includes('market') || q.includes('vendor')) keywords.push('market', 'vegetable');

    let intent: 'corridor_analysis' | 'root_cause' | 'comparison' | 'repair_durability' | 'general_search' =
      'general_search';
    if (q.includes('compare') || q.includes('vs') || q.includes('versus')) {
      intent = 'comparison';
    } else if (q.includes('why') || q.includes('cause') || q.includes('reason')) {
      intent = 'root_cause';
    } else if (q.includes('corridor') || q.includes('where') || q.includes('location')) {
      intent = 'corridor_analysis';
    } else if (q.includes('repair') || q.includes('durability') || q.includes('holding up')) {
      intent = 'repair_durability';
    }

    const summaryParts: string[] = [];
    if (category !== 'all') summaryParts.push(`Category: ${category}`);
    if (zone !== 'all') summaryParts.push(`Zone: ${zone}`);
    if (isRecurrenceFocus) summaryParts.push('Recurrent & Chronic Only');
    if (severity !== 'all') summaryParts.push(`Severity: ${severity}`);
    const summary = summaryParts.length > 0 ? summaryParts.join(' • ') : 'Full Metropolitan Dataset Scan';

    return {
      category,
      zone,
      severity,
      isRecurrenceFocus,
      keywords,
      intent,
      summary,
    };
  }

  private async tryServerGeminiAsk(
    queryText: string,
    context: {
      matchedCount: number;
      category: string;
      zone: string;
      isRecurrence: boolean;
      sampleIncidentIds: string[];
      hotspots: string[];
    }
  ): Promise<AskCivicPulseQuery['answer'] | null> {
    try {
      const res = await fetch('/api/ai/insights/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: queryText,
          context,
        }),
      });

      if (!res.ok) return null;
      const data = await res.json();
      if (data && data.success && data.answer) {
        return data.answer;
      }
      return null;
    } catch {
      return null;
    }
  }

  private generateDeterministicAnswer(
    queryText: string,
    intent: 'corridor_analysis' | 'root_cause' | 'comparison' | 'repair_durability' | 'general_search',
    incidents: Incident[],
    hotspots: Hotspot[],
    category?: IncidentCategory | 'all',
    zone?: string | 'all'
  ): AskCivicPulseQuery['answer'] {
    const q = queryText.toLowerCase();

    // Specific Response: Tonk Road Potholes
    if (q.includes('tonk') || (category === 'Pothole' && (zone === 'South Zone' || q.includes('corridor')))) {
      return {
        headline: 'Tonk Corridor Potholes Are Driven by Unresolved Stormwater Culvert Siltation',
        observedFacts: [
          '4 incidents recorded along Tonk Road Pillar 12–16 (INC-1002, INC-1005, INC-1018, INC-1048).',
          'Recurrence rate is 75% with cold-mix bitumen patches failing in an average of 22 days.',
          'Culvert 4B directly adjacent to Pillar 14 exhibits 65% silt clogging, causing water ponding across carriageways.',
        ],
        interpretation:
          'Roads crews are executing rapid surface patches without addressing the subgrade moisture saturation caused by drainage overflow. The water table weakens the bituminous bond from below, guaranteeing failure under commercial traffic within 3 weeks.',
        recommendation:
          'Mandate joint capital intervention: Stormwater Drainage Board must desilt and reconstruct Box Culvert 4B before Roads & Bridges authorizes subsequent asphalt resurfacing.',
        limitations: [
          'Subsurface moisture sensor telemetry is inferred from inspection logs; probe confirmation is pending.',
        ],
        confidence: 94,
        source: 'deterministic-city-analyst',
      };
    }

    // Specific Response: West Zone / Gopalpura Traffic Lights
    if (q.includes('signal') || q.includes('traffic') || q.includes('gopalpura') || q.includes('surge')) {
      return {
        headline: 'Traffic Signal Controllers at Gopalpura Bypass Experience Storm-Induced Electrical Surges',
        observedFacts: [
          '3 consecutive master controller burnouts documented at Gopalpura Bypass (INC-1019, INC-1040, INC-1053).',
          'Repair logs (REP-207) confirm scorched relay and timing microcontroller boards.',
          'Failures coincide with electrical distribution transients during storm weather on the 11kV feeder line.',
        ],
        interpretation:
          'The intersection cabinet lacks high-capacity stage-1 gas discharge tube surge arrestors. Grid switching transients and lightning ground-potential rises conduct straight into the low-voltage control microchips.',
        recommendation:
          'Retrofit heavy-duty Type 1+2 surge protective devices (SPD) on the master distribution box and install a secondary battery buffer.',
        limitations: [
          'DISCOM electrical grid substation transient logs have been formally requested but not yet digitally integrated.',
        ],
        confidence: 91,
        source: 'deterministic-city-analyst',
      };
    }

    // Specific Response: Comparison South vs West Zone
    if (intent === 'comparison' || q.includes('compare') || (q.includes('south') && q.includes('west'))) {
      const southIncidents = incidents.filter((i) => i.zone.toLowerCase().includes('south'));
      const westIncidents = incidents.filter((i) => i.zone.toLowerCase().includes('west'));
      const southRecurrent = southIncidents.filter((i) => i.recurrenceCount > 0).length;
      const westRecurrent = westIncidents.filter((i) => i.recurrenceCount > 0).length;

      return {
        headline: 'South Zone Suffers Hydraulic Saturation While West Zone Suffers Electrical Vulnerability',
        observedFacts: [
          `South Zone logs ${southIncidents.length} incidents with ${southRecurrent} recurrent failures (Tonk Corridor & Jawahar Circle).`,
          `West Zone logs ${westIncidents.length} incidents with ${westRecurrent} recurrent failures (Gopalpura Bypass & Civil Lines).`,
          'South Zone failures are predominantly civil infrastructure (Potholes, Drainage, Water Leaks); West Zone is 60% electrical/transit systems.',
        ],
        interpretation:
          'South Zone challenges require inter-agency coordination between Roads and the Water Board. West Zone requires electrical hardening with the local power distribution utility (DISCOM).',
        recommendation:
          'Deploy Ground Penetrating Radar in South Zone arterial corridors; conduct power quality audits across West Zone traffic cabinets.',
        limitations: [
          'Comparison reflects current 90-day seeded incident registry across Mayura Metro City.',
        ],
        confidence: 90,
        source: 'deterministic-city-analyst',
      };
    }

    // Default High-Precision Synthesized Answer
    const sampleIds = incidents.slice(0, 4).map((i) => i.id).join(', ');
    const recurringCount = incidents.filter((i) => i.recurrenceCount > 0).length;
    const recurrenceRate = Math.round((recurringCount / Math.max(1, incidents.length)) * 100);

    return {
      headline: `Analysis of ${incidents.length} Matched Incidents Across ${category !== 'all' ? category : 'All Categories'}`,
      observedFacts: [
        `Identified ${incidents.length} relevant incident records including ${sampleIds}.`,
        `${recurringCount} of these incidents (${recurrenceRate}%) are recurrent failures tied to previous historical complaints.`,
        hotspots.length > 0
          ? `Associated with chronic hotspot zones: ${hotspots.map((h) => h.locationName).slice(0, 2).join(', ')}.`
          : 'Spread across decentralized municipal corridors with no single point of failure.',
      ],
      interpretation:
        'The empirical data demonstrates that localized environmental factors (such as unchanneled water runoff and electrical grid transients) repeatedly trigger rapid asset degradation after conventional single-agency repairs.',
      recommendation:
        'Transition from isolated reactive patch work orders to root-cause cross-departmental interventions with verified contractor durability milestones.',
      limitations: [
        'Data represents municipal records within the active analytical date range. Private utility telemetry may be pending.',
      ],
      confidence: 88,
      source: 'deterministic-city-analyst',
    };
  }
}

export const queryEngine = new QueryEngine();
