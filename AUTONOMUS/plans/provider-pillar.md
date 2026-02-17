# Provider Pillar Workstream (GPT Breeze)

Goal: Build a searchable, evergreen pillar for "GPT Breeze providers" and ship one provider guide per day/week without manual effort.

## Sources

- Provider/model catalog: `src/data/models-api.json` (large; script-driven parsing)
- Extension setup truth: `gptB/src/config/index.mjs`, `gptB/src/popup/Popup.jsx`, `gptB/src/services/apis/openai-api.mjs`

## Deliverables

1) Hub page
- `/guide/providers/` — "Supported AI Providers in GPT Breeze".
- Sections:
  - Built-in providers (OpenAI, Google Gemini, Anthropic, OpenRouter)
  - OpenAI-compatible providers (Groq, Together, Mistral, etc.)
  - Routers/gateways (OpenRouter, Vercel AI Gateway, Cloudflare AI Gateway, Helicone)
  - Local providers (Ollama local, LM Studio)

2) Provider pages (one per provider)
- `/guide/providers/<provider>/`
- Standard structure:
  - What it is (1 paragraph)
  - When to use it (latency/cost/privacy)
  - Setup in GPT Breeze (Credentials + Custom Model)
  - Example model IDs (explicitly labeled as examples)
  - Troubleshooting (401/403/404/429)
  - Links: /pricing, /ai-model-cost-calculator..., /privacy-first, /guide/getting-started

## Setup truth (must match extension behavior)

### Credentials
- Fields: name, baseUrl, apiKey, type
- Default credential types: openai, gemini, anthropic, openrouter, websession
- Custom credentials: type defaults to `custom`.

### Custom Models
- Model fields used by UI:
  - `name` = API model ID
  - `unique_name` = display name (label)
  - `credentialId` = credential to use
  - Optional: contextLength, intelligence, reasoning, speed
- Free plan limit: up to 2 custom models.

## Automation plan

- Build scripts:
  - `AUTONOMUS/tools/providers-index.mjs` — parse models-api.json, compute provider counts, write provider queue.
  - `AUTONOMUS/tools/publish-provider-guide.mjs` — create next provider guide markdown in `src/content/guide/providers/`.
  - Extend `seo:verify` to also check guide hygiene (title, pubDate, description, tags).

- Scheduling:
  - Phase 1 (first 2 weeks): 3 provider guides/week + daily blog post.
  - Phase 2: 1 provider guide/week + 1 refresh/week.

## Priority provider order (initial)

1. OpenAI
2. Anthropic
3. Google Gemini
4. OpenRouter
5. Groq (OpenAI-compatible)
6. Mistral (OpenAI-compatible)
7. Together AI (OpenAI-compatible)
8. Ollama (local + cloud)
9. LM Studio (local)
10. Vercel AI Gateway (router)
11. Cloudflare AI Gateway / Workers AI
12. Azure OpenAI
