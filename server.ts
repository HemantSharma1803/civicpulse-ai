import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { INITIAL_INCIDENTS, INITIAL_REPAIR_EVENTS, INITIAL_HOTSPOTS } from './src/data/seedData';
import { validateImageInput } from './server/ai/validators';
import { incidentVisionService } from './server/ai/incidentVisionService';
import { memorySummarizerService } from './server/ai/memorySummarizerService';
import { geospatialSummarizerService } from './server/ai/geospatialSummarizerService';
import { insightsService } from './server/ai/insightsService';
import { findRelatedIncidents } from './src/services/relationshipEngine';

const app = express();
const PORT = Number(process.env.PORT || 3000);

// Accept larger payload for base64 photo uploads
app.use(express.json({ limit: '20mb' }));

// Lazy-initialized Gemini client
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    geminiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return geminiClient;
}

// --------------------------------------------------------------------------
// API Routes (Prefix: /api/*)
// --------------------------------------------------------------------------

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'CivicPulse AI Core Service',
    environment: 'demo-prototype',
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// AI Multimodal Incident Vision Analysis
app.post('/api/ai/analyze-incident', async (req, res) => {
  try {
    const validation = validateImageInput(req.body);
    if (!validation.isValid || !validation.data) {
      return res.status(400).json({
        success: false,
        error: validation.error || 'Invalid request payload',
        fallbackAvailable: true,
      });
    }

    const result = await incidentVisionService.analyzeImage(validation.data);
    res.json(result);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('[CivicPulse AI Server] Analyze endpoint error:', errorMsg);
    res.status(500).json({
      success: false,
      error: `Server internal error during AI analysis: ${errorMsg}`,
      fallbackAvailable: true,
    });
  }
});

// AI Failure Memory Intelligence Summarization
app.post('/api/ai/summarize-memory', async (req, res) => {
  try {
    const summary = await memorySummarizerService.summarizeMemory(req.body);
    res.json({
      success: true,
      summary,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('[CivicPulse AI Server] Memory summarize error:', errorMsg);
    res.status(500).json({
      success: false,
      error: `Failure memory summarization failed: ${errorMsg}`,
    });
  }
});

// AI Geospatial Spatial Intelligence Summarization
app.post('/api/ai/geospatial-summary', async (req, res) => {
  try {
    const summary = await geospatialSummarizerService.summarizeSpatialData(req.body);
    res.json({
      success: true,
      summary,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('[CivicPulse AI Server] Geospatial summarize error:', errorMsg);
    res.status(500).json({
      success: false,
      error: `Geospatial summarization failed: ${errorMsg}`,
    });
  }
});

// AI City Analyst Grounded Query Endpoint
app.post('/api/ai/insights/ask', async (req, res) => {
  try {
    const { query, context } = req.body;
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'query string is required.' });
    }

    const answer = await insightsService.answerCivicQuery(query, context || {
      matchedCount: 0,
      category: 'all',
      zone: 'all',
      isRecurrence: false,
      sampleIncidentIds: [],
      hotspots: [],
    });

    res.json({
      success: true,
      answer,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('[CivicPulse AI Server] Insights ask error:', errorMsg);
    res.status(500).json({
      success: false,
      error: `AI Insights query failed: ${errorMsg}`,
    });
  }
});

// CivicPulse Infrastructure Memory Check
app.post('/api/memory/check', (req, res) => {
  try {
    const { latitude, longitude, category, title, description, excludeIncidentId } = req.body;
    if (typeof latitude !== 'number' || typeof longitude !== 'number' || !category) {
      return res.status(400).json({
        error: 'latitude (number), longitude (number), and category (string) are required.',
      });
    }

    const memoryResult = findRelatedIncidents(
      {
        latitude,
        longitude,
        category,
        title,
        description,
        excludeIncidentId,
      },
      INITIAL_INCIDENTS,
      INITIAL_HOTSPOTS
    );

    res.json(memoryResult);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: errorMsg });
  }
});

// Incidents List & Query
app.get('/api/incidents', (req, res) => {
  const { category, severity, status, search } = req.query;
  let list = [...INITIAL_INCIDENTS];

  if (category && typeof category === 'string') {
    list = list.filter((i) => i.category.toLowerCase() === category.toLowerCase());
  }
  if (severity && typeof severity === 'string') {
    list = list.filter((i) => i.severity.toLowerCase() === severity.toLowerCase());
  }
  if (status && typeof status === 'string') {
    list = list.filter((i) => i.status.toLowerCase() === status.toLowerCase());
  }
  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    list = list.filter(
      (i) =>
        i.id.toLowerCase().includes(q) ||
        i.title.toLowerCase().includes(q) ||
        i.address.toLowerCase().includes(q)
    );
  }

  res.json({
    total: list.length,
    incidents: list,
  });
});

// Single Incident Detail
app.get('/api/incidents/:id', (req, res) => {
  const incident = INITIAL_INCIDENTS.find(
    (i) => i.id.toLowerCase() === req.params.id.toLowerCase()
  );
  if (!incident) {
    return res.status(404).json({ error: 'Incident not found in memory' });
  }

  const relatedRepairs = INITIAL_REPAIR_EVENTS.filter(
    (r) => r.incidentId.toLowerCase() === req.params.id.toLowerCase()
  );
  const relatedIncidents = INITIAL_INCIDENTS.filter((i) =>
    incident.relatedIncidentIds.includes(i.id)
  );

  res.json({
    incident,
    repairs: relatedRepairs,
    relatedIncidents,
  });
});

// Hotspots
app.get('/api/hotspots', (req, res) => {
  res.json({
    hotspots: INITIAL_HOTSPOTS,
    total: INITIAL_HOTSPOTS.length,
  });
});

// Repairs
app.get('/api/repairs', (req, res) => {
  res.json({
    repairs: INITIAL_REPAIR_EVENTS,
    total: INITIAL_REPAIR_EVENTS.length,
  });
});

// AI Service Interfaces (Prepared for next intelligence segments)
app.get('/api/ai/capabilities', (req, res) => {
  res.json({
    activeModel: 'gemini-2.5-flash',
    features: [
      {
        id: 'vision_analysis',
        name: 'Multimodal Road & Infrastructure Damage Classifier',
        status: 'active',
        description: 'Pothole depth, crack severity, and structural hazard segmentation.',
      },
      {
        id: 'recurrence_matching',
        name: 'Semantic Failure Lineage Matching',
        status: 'active',
        description: 'Correlating historical repair records against renewed complaints.',
      },
      {
        id: 'natural_query',
        name: 'Municipal Natural Language Intelligence Agent',
        status: 'active',
        description: 'Ask questions regarding infrastructure failure patterns across zones.',
      },
    ],
  });
});

// --------------------------------------------------------------------------
// Vite & Static Asset Handling
// --------------------------------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CivicPulse AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
