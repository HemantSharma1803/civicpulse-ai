import { GoogleGenAI } from '@google/genai';

interface MemorySummarizerRequest {
  incidentId: string;
  incidentTitle: string;
  locationName: string;
  currentState: string;
  patternIndex: number;
  incidentCount: number;
  repairCount: number;
  averageIntervalDays: number | null;
  longestQuietPeriodDays: number | null;
  timelineEvents: Array<{
    date: string;
    type: string;
    title: string;
    description: string;
    elapsedDays?: number;
  }>;
  explanations: Array<{
    targetIncidentId: string;
    relationType: string;
    distanceMeters: number;
    auditText: string;
  }>;
}

interface MemorySummaryResponse {
  oneLineSummary: string;
  executiveBrief: string;
  evidencePoints: string[];
  recommendedAction: string;
  source: 'gemini-2.5-flash' | 'deterministic-engine';
}

export class MemorySummarizerService {
  private ai: GoogleGenAI | null = null;

  private getClient(): GoogleGenAI | null {
    if (!this.ai && process.env.GEMINI_API_KEY) {
      this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    }
    return this.ai;
  }

  public async summarizeMemory(
    data: MemorySummarizerRequest
  ): Promise<MemorySummaryResponse> {
    const client = this.getClient();

    if (!client) {
      return this.generateDeterministicSummary(data);
    }

    try {
      const prompt = `You are the CivicPulse AI Infrastructure Memory Engine.
Analyze the following structured failure history for a civic infrastructure node and provide an executive summary.

STRICT EDITORIAL RULES:
1. Ground your response ONLY on the provided structured facts.
2. NEVER claim causality (do NOT say "the repair failed" or "poor workmanship"). Instead say neutral factual statements such as "Another related incident was recorded X days following the repair work order."
3. Distinguish between duplicate reports (reported within days before repair) and recurring failure (reported after repair).
4. Output concise, professional municipal intelligence.

STRUCTURED DATA:
- Incident ID: ${data.incidentId} (${data.incidentTitle})
- Location: ${data.locationName}
- Status: ${data.currentState} (Pattern Index: ${data.patternIndex}/100)
- Total Incidents: ${data.incidentCount}, Repairs Logged: ${data.repairCount}
- Mean Recurrence Interval: ${data.averageIntervalDays ? `${data.averageIntervalDays} days` : 'N/A'}
- Max Quiet Interval: ${data.longestQuietPeriodDays ? `${data.longestQuietPeriodDays} days` : 'N/A'}

Recorded Timeline:
${data.timelineEvents
  .map(
    (e, idx) =>
      `${idx + 1}. [${e.date}] ${e.type}: ${e.title} - ${e.description}${
        e.elapsedDays ? ` (+${e.elapsedDays}d)` : ''
      }`
  )
  .join('\n')}

Relations & Explanations:
${data.explanations
  .map(
    (x) =>
      `- ${x.targetIncidentId} (${x.relationType}): ${x.distanceMeters}m away. ${x.auditText}`
  )
  .join('\n')}

Return a valid JSON object matching this schema:
{
  "oneLineSummary": "1 concise sentence summarizing the infrastructure failure memory",
  "executiveBrief": "2-3 sentences explaining the recurrence pattern, intervals, and repair interventions",
  "evidencePoints": ["3 to 4 short factual evidence bullet points"],
  "recommendedAction": "Actionable next step for municipal engineers"
}`;

      const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const text = response.text || '';
      const parsed = JSON.parse(text);

      return {
        oneLineSummary: parsed.oneLineSummary || `Recurrence history tracked for ${data.locationName}`,
        executiveBrief: parsed.executiveBrief || '',
        evidencePoints: Array.isArray(parsed.evidencePoints) ? parsed.evidencePoints : [],
        recommendedAction: parsed.recommendedAction || 'Schedule geotechnical investigation.',
        source: 'gemini-2.5-flash',
      };
    } catch (err) {
      console.warn('[MemorySummarizerService] Gemini call failed, using deterministic fallback:', err);
      return this.generateDeterministicSummary(data);
    }
  }

  private generateDeterministicSummary(
    data: MemorySummarizerRequest
  ): MemorySummaryResponse {
    const isRecurring = data.currentState === 'RECURRING' || data.currentState === 'PERSISTENT';
    const hasRepairs = data.repairCount > 0;

    let oneLineSummary = '';
    if (isRecurring && hasRepairs) {
      oneLineSummary = `${data.incidentCount} incidents and ${data.repairCount} repairs recorded across ${data.locationName}, with re-emergence recurring at an average interval of ${data.averageIntervalDays || 30} days.`;
    } else if (data.currentState === 'RESOLVED') {
      oneLineSummary = `Prior defect history at ${data.locationName} has been stabilized with no active open complaints.`;
    } else {
      oneLineSummary = `Initial baseline defect recorded at ${data.locationName} with no prior failure history.`;
    }

    const executiveBrief = `CivicPulse Failure Memory Engine tracked ${data.incidentCount} chronological reports and ${data.repairCount} municipal interventions at this coordinate. ${
      data.averageIntervalDays
        ? `Recurrence intervals indicate defect reappearance approximately ${data.averageIntervalDays} days post-intervention.`
        : 'Sufficient historical cycles have been logged to establish a baseline location profile.'
    } Subsurface investigation is recommended prior to further surface repaving.`;

    const evidencePoints: string[] = [
      `Pattern Index calculated at ${data.patternIndex}/100 based on spatial and temporal correlation.`,
      `Spatial clustering within 50m of ${data.locationName}.`,
      data.averageIntervalDays
        ? `Mean cycle duration of ${data.averageIntervalDays} days observed across ${data.incidentCount} complaints.`
        : `Single complaint cycle recorded to date.`,
      data.repairCount > 0
        ? `${data.repairCount} municipal repair work order(s) documented in historical log.`
        : 'Zero prior municipal work orders logged for this specific defect node.',
    ];

    return {
      oneLineSummary,
      executiveBrief,
      evidencePoints,
      recommendedAction:
        data.currentState === 'PERSISTENT'
          ? 'Mandate subsurface drainage inspection and review contractor material specifications.'
          : data.currentState === 'RECURRING'
          ? 'Dispatch field auditor to verify prior repair boundary integrity.'
          : 'Standard dispatch for surface restoration.',
      source: 'deterministic-engine',
    };
  }
}

export const memorySummarizerService = new MemorySummarizerService();
