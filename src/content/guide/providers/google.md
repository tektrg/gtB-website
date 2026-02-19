---
title: "How to set up Google in GPT Breeze (API key + custom model)"
description: "Step-by-step: add your Google API credentials in GPT Breeze and create a custom model you can use for summaries, writing, and workflows."
pubDate: 2026-02-18
updatedDate: 2026-02-19
topicId: "provider-google"
tags: ["providers", "google", "byom", "api-keys"]
draft: false
---

# How to set up Google in GPT Breeze (API key + custom model)

This guide shows how to use **Google** with **GPT Breeze** by adding a credential (API key + base URL) and then creating a custom model.

## What this provider is

Google (Gemini) is one of the providers you can connect to GPT Breeze as part of a **BYOM/BYOK** workflow (Bring Your Own Model / Bring Your Own Key).
- Provider docs: https://ai.google.dev/gemini-api/docs/pricing

## When to use Google (Gemini)

Use Google (Gemini) if you want:

- A Gemini-based model option in your BYOK setup.
- A built-in provider type in GPT Breeze (credential type: `google`).
- A good fit for general summarization + writing workflows.

If you’re unsure which provider/model to pick, start with [Getting started](/guide/getting-started/) and compare cost tradeoffs on [Pricing](/pricing).

## Step 1 — Add credentials (provider / API key)

Open **GPT Breeze → Settings → Credentials (Providers)** and add a credential.

- Provider type: **google** (built-in)
- Base URL: leave default unless you know you need a custom endpoint
- API key: paste your **Google** API key

**Notes:** this provider typically expects environment variables like:
- `GOOGLE_GENERATIVE_AI_API_KEY`
- `GEMINI_API_KEY`

## Step 2 — Add a custom model

Then go to **Custom Models → Add model** and fill:

- **Model ID**: the exact model identifier the API expects
- **Display name**: a human-friendly name (this is what you’ll pick in the model selector)
- **Credential**: select the credential you created in Step 1

If you’re on the free plan, you can create **up to 2 custom models**.

## Example model IDs (from the model catalog)

Use these as **examples** (model availability can change):

- `gemini-embedding-001`
- `gemini-2.5-flash-lite-preview-09-2025`
- `gemini-2.5-pro-preview-06-05`
- `gemini-2.5-flash-preview-04-17`
- `gemini-2.5-flash-preview-09-2025`
- `gemini-2.5-pro-preview-05-06`
- `gemini-2.5-flash-preview-05-20`
- `gemini-2.5-flash`
- `gemini-live-2.5-flash`
- `gemini-3-flash-preview`

## Troubleshooting

- **401/403**: API key is missing/invalid, or your account has no access. Re-check the key and plan.
- **404**: model ID is wrong, or base URL is wrong. Copy model ID exactly from the provider dashboard.
- **429**: rate limit. Try a smaller model, wait, or upgrade the provider plan.

## Next steps

- Compare approaches: [Pricing](/pricing)
- If you care about data boundaries: [Privacy-first workflow](/privacy-first)
- New here: [Getting started](/guide/getting-started/)
- Estimate costs: [AI model cost calculator](/ai-model-cost-calculator-and-price-comparation)
