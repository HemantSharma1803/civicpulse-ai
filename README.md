# CivicPulse AI

> **Cities record complaints. CivicPulse remembers failures.**

CivicPulse AI is a hackathon-ready municipal infrastructure intelligence prototype that turns citizen reports into an evidence-backed operational workflow. It combines incident reporting, multimodal Gemini analysis, failure memory, geospatial intelligence, AI insights, analytics, and field operations in one responsive command center.

## What is included

- **Incident reporting** — structured citizen/operator intake with AI-assisted classification.
- **AI vision** — Gemini-powered analysis of infrastructure damage with confidence and human-review signals.
- **Failure Memory** — connects new reports to historical incidents, recurrence patterns, repairs, and hotspots.
- **City Intelligence** — spatial hotspots, zone/corridor context, timeline playback, and accessible list views.
- **AI Insights** — grounded municipal questions, deterministic evidence, lifecycle states, and executive summaries.
- **Field Operations** — work-order concepts, team routing, remediation history, verification, and case-review flows.
- **Analytics** — infrastructure health, trends, recurrence, and operational metrics.
- **Accessibility** — keyboard navigation, focus states, contrast mode, responsive layouts, and accessible alternatives for map-heavy views.
- **Demo safety** — deterministic seeded data and graceful AI fallback paths so the core demo remains usable without a Gemini key.

## Architecture

```text
React + Vite
   |
   +-- CivicPulseContext (application state)
   +-- Views / Components
   +-- Deterministic domain engines
   |     +-- Failure Memory
   |     +-- Geospatial intelligence
   |     +-- Insight engine
   |     +-- Operations types/workflows
   |
Express server
   |
   +-- /api/health
   +-- /api/incidents
   +-- /api/hotspots
   +-- /api/repairs
   +-- /api/memory/check
   +-- /api/ai/analyze-incident
   +-- /api/ai/summarize-memory
   +-- /api/ai/geospatial-summary
   +-- /api/ai/insights/ask
   |
Google Gemini (server-side only)
```

## Local setup

**Requirements:** Node.js 22+

```bash
npm install
cp .env.example .env.local
# Add GEMINI_API_KEY to .env.local when AI features are required
npm run dev
```

Open the local URL printed by the server (normally `http://localhost:3000`).

## Verification

```bash
npm run lint
npm run build
npm start
```

`npm run lint` performs the TypeScript check. `npm run build` creates the Vite frontend and bundles the Express server into `dist/server.cjs`.

## Gemini configuration

The API key is read on the server from `GEMINI_API_KEY`. Do **not** commit `.env.local` or any real API key. The repository includes `.env.example` as the safe configuration template.

If Gemini is not configured, the application should continue to expose its deterministic/demo flows where a fallback is implemented; AI-only actions should communicate that configuration is required rather than silently failing.

## Git / CI / deployment

- `.gitignore` excludes dependencies, build output, logs, and environment secrets.
- `.github/workflows/ci.yml` runs dependency installation, type checking, and the production build on pushes/PRs.
- `.github/workflows/deploy-render.yml` provides an optional manual Render deploy hook workflow; the repository CI verifies the app before deployment.
- `render.yaml` describes a Node web service with `/api/health` as the health check.
- `Dockerfile` provides a production container build.
- `.dockerignore` keeps local/development files out of the image.

### Render

1. Create a new Web Service from the repository.
2. Use the included `render.yaml`, or use:
   - Build: `npm install --no-audit --no-fund && npm run build`
   - Start: `npm start`
3. Add `GEMINI_API_KEY` as a secret environment variable.
4. Verify `/api/health` after deployment.

## Demo flow

For a strong hackathon walkthrough:

1. Open **Overview** to establish the city-level problem.
2. Submit an infrastructure report and show AI classification.
3. Open the **Failure Memory** result to show historical recurrence and evidence.
4. Switch to **City Intelligence** to show the spatial pattern.
5. Open **AI Insights** and ask a grounded municipal question.
6. Move to **Operations** to show the action path from evidence to remediation.
7. Finish with **Analytics** and the measurable impact story.

## Security notes

- Keep Gemini credentials server-side.
- Never commit `.env.local` or production secrets.
- Treat AI output as decision support; human review remains available for uncertain or high-impact classifications.
- Seed/demo data is clearly separated from production integrations.

## Project status

CivicPulse AI is a competition prototype. Its deterministic demo dataset is designed for a reliable presentation while the server APIs provide integration points for real municipal systems.

## GitHub Pages demo

The frontend can be deployed to GitHub Pages at:
`https://hemantsharma1803.github.io/civicpulse-ai/`

The GitHub Pages workflow builds the Vite frontend and publishes `dist/`. The Express/Gemini API server remains a separate backend deployment and is not provided by GitHub Pages.
