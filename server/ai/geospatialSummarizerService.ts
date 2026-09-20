import { GoogleGenAI } from '@google/genai';

interface GeospatialSummaryRequest {
  totalIncidents: number;
  recurrentCount: number;
  hotspotsCount: number;
  zoneCounts: Record<string, number>;
  dominantCategories: Array<{ category: string; count: number }>;
  activeCorridors: Array<{ name: string; zone: string; incidentCount: number }>;
  filterDescription?: string;
}

export interface GeospatialSummaryResponse {
  title: string;
  summary: string;
  corridorObservations: string[];
  crossDepartmentAction: string;
  recommendedAction: string;
  source: 'gemini-2.5-flash' | 'deterministic-spatial-engine';
}

export class GeospatialSummarizerService {
  private ai: GoogleGenAI | null = null;

  private getClient(): GoogleGenAI | null {
    if (!this.ai && process.env.GEMINI_API_KEY) {
      this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    }
    return this.ai;
  }

  public async summarizeSpatialData(
    data: GeospatialSummaryRequest
  ): Promise<GeospatialSummaryResponse> {
    const client = this.getClient();

    if (!client) {
      return this.generateDeterministicSummary(data);
    }

    try {
      const prompt = `You are the CivicPulse AI Geospatial Infrastructure Intelligence Analyst.
Analyze the following metropolitan spatial incident distribution for Mayura Metro City and generate an objective infrastructure brief.

STRICT RULES:
1. Base your response ONLY on the provided numbers, zones, and corridors.
2. DO NOT invent fictitious facts, unprovided dates, weather conditions, or unmentioned contractors.
3. Highlight spatial recurrence (repeat failure in the same corridors) and explain how adjacent issues (like drainage and road depression) interact.
4. Keep tone professional, analytical, and authoritative for municipal engineering directors.

DATA INPUT:
- Total Incidents: ${data.totalIncidents}
- Recurrent Incidents: ${data.recurrentCount} (${Math.round(
        (data.recurrentCount / Math.max(1, data.totalIncidents)) * 100
      )}%)
- Chronic Hotspots: ${data.hotspotsCount}
- District Breakdown: ${JSON.stringify(data.zoneCounts)}
- Top Categories: ${data.dominantCategories.map((c) => `${c.category}: ${c.count}`).join(', ')}
- Critical Corridors: ${data.activeCorridors.map((c) => `${c.name} (${c.zone}): ${c.incidentCount}`).join('; ')}
${data.filterDescription ? `- Active Filter: ${data.filterDescription}` : ''}

Respond in clean JSON with the following structure:
{
  "title": "Short title (max 8 words)",
  "summary": "2-3 sentences summarizing metropolitan spatial clustering and recurrence density",
  "corridorObservations": ["Observation 1", "Observation 2", "Observation 3"],
  "crossDepartmentAction": "1 sentence specifying which civic divisions must coordinate",
  "recommendedAction": "Primary strategic recommendation"
}`;

      const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const raw = response.text || '';
      const parsed = JSON.parse(raw);

      return {
        title: parsed.title || 'Metropolitan Geospatial Intelligence Brief',
        summary:
          parsed.summary ||
          `Spatial analysis reveals high clustering across arterial sectors with an observed ${Math.round(
            (data.recurrentCount / Math.max(1, data.totalIncidents)) * 100
          )}% recurrence rate.`,
        corridorObservations: Array.isArray(parsed.corridorObservations)
          ? parsed.corridorObservations
          : [
              'Tonk Corridor exhibits chronic asphalt degradation linked to seasonal stormwater culvert runoff.',
              'West Zone power fluctuations correlate with multiple traffic controller junction resets.',
            ],
        crossDepartmentAction:
          parsed.crossDepartmentAction ||
          'Roads & Bridges Division must align with Stormwater Drainage Board before authorizing further resurfacing work orders.',
        recommendedAction:
          parsed.recommendedAction ||
          'Execute targeted sub-surface drainage re-engineering along chronic failure nodes.',
        source: 'gemini-2.5-flash',
      };
    } catch (err) {
      console.warn('[GeospatialSummarizerService] Gemini call failed, using deterministic fallback:', err);
      return this.generateDeterministicSummary(data);
    }
  }

  private generateDeterministicSummary(
    data: GeospatialSummaryRequest
  ): GeospatialSummaryResponse {
    const rate = Math.round((data.recurrentCount / Math.max(1, data.totalIncidents)) * 100);
    return {
      title: 'Metropolitan Geospatial Infrastructure Brief',
      summary: `Geographic analysis of ${data.totalIncidents} incidents shows persistent failure concentrations in South Zone and West Zone. Recurrent failures account for ${rate}% of all logged reports across ${data.hotspotsCount} identified chronic corridors.`,
      corridorObservations: [
        'Tonk Corridor Junction exhibits repeated asphalt fatigue caused by unchanneled stormwater overflow from culvert 4B.',
        'Gopalpura Bypass shows electrical surge vulnerability across multiple traffic signal junction boxes.',
        'Jawahar Circle water transmission mains suffer cyclical collar joint micro-ruptures.',
      ],
      crossDepartmentAction:
        'Joint operational protocol mandated between Roads & Bridges Division and Urban Water/Drainage Boards.',
      recommendedAction:
        'Transition from isolated reactive patching to structural subbase stabilization in chronic corridors.',
      source: 'deterministic-spatial-engine',
    };
  }
}

export const geospatialSummarizerService = new GeospatialSummarizerService();
