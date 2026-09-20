import { GoogleGenAI } from '@google/genai';
import { incidentVisionResponseSchema, IncidentVisionOutput } from './schemas';
import { CIVIC_VISION_SYSTEM_INSTRUCTION, buildVisionUserPrompt } from './prompts';
import { validateAndSanitizeVisionOutput, ImageAnalysisInput } from './validators';

export interface VisionAnalysisResult {
  success: boolean;
  analysis?: IncidentVisionOutput;
  error?: string;
  isAiGenerated: boolean;
  fallbackAvailable: boolean;
  modelUsed?: string;
}

export class IncidentVisionService {
  private client: GoogleGenAI | null = null;
  private modelName = 'gemini-3.8-flash';

  constructor() {
    this.initClient();
  }

  private initClient(): void {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey.trim()) {
      try {
        this.client = new GoogleGenAI({ apiKey: apiKey.trim() });
      } catch (err) {
        console.error('[CivicPulse AI] Error initializing GoogleGenAI client:', err);
        this.client = null;
      }
    }
  }

  public isAvailable(): boolean {
    return Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim());
  }

  public async analyzeImage(input: ImageAnalysisInput): Promise<VisionAnalysisResult> {
    if (!this.client) {
      this.initClient();
    }

    if (!this.client) {
      return {
        success: false,
        error: 'Gemini API key is not configured in this environment. Manual review mode is available.',
        isAiGenerated: false,
        fallbackAvailable: true,
      };
    }

    const userPrompt = buildVisionUserPrompt(input.userDescription);

    try {
      // Set a 25-second timeout promise
      const apiPromise = this.client.models.generateContent({
        model: this.modelName,
        contents: [
          {
            inlineData: {
              mimeType: input.mimeType,
              data: input.imageBase64,
            },
          },
          userPrompt,
        ],
        config: {
          systemInstruction: CIVIC_VISION_SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json',
          responseSchema: incidentVisionResponseSchema,
          temperature: 0.1,
        },
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('AI multimodal analysis timed out after 25 seconds')), 25000)
      );

      const response = await Promise.race([apiPromise, timeoutPromise]);

      const textOutput = response.text;
      if (!textOutput) {
        return {
          success: false,
          error: 'Empty response returned from multimodal model.',
          isAiGenerated: false,
          fallbackAvailable: true,
        };
      }

      let parsedObj: unknown;
      try {
        parsedObj = JSON.parse(textOutput);
      } catch (parseError) {
        console.error('[CivicPulse AI] Failed to parse model JSON:', textOutput, parseError);
        return {
          success: false,
          error: 'Model response could not be parsed into structured JSON.',
          isAiGenerated: false,
          fallbackAvailable: true,
        };
      }

      const validation = validateAndSanitizeVisionOutput(parsedObj);
      if (!validation.isValid || !validation.data) {
        return {
          success: false,
          error: validation.error || 'Model response failed schema compliance validation.',
          isAiGenerated: false,
          fallbackAvailable: true,
        };
      }

      return {
        success: true,
        analysis: validation.data,
        isAiGenerated: true,
        fallbackAvailable: true,
        modelUsed: this.modelName,
      };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error('[CivicPulse AI] Gemini vision generation error:', errorMessage);

      return {
        success: false,
        error: `AI analysis encountered an issue: ${errorMessage}. You may continue with manual inspection.`,
        isAiGenerated: false,
        fallbackAvailable: true,
      };
    }
  }
}

export const incidentVisionService = new IncidentVisionService();
