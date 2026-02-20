---
title: "How to set up Google in GPT Breeze (API key + custom model)"
description: "Step-by-step: add your Google API credentials in GPT Breeze and create a custom model you can use for summaries, writing, and workflows."
pubDate: 2026-02-18
updatedDate: 2026-02-20
topicId: "provider-google"
tags: ["providers", "google", "byom", "api-keys"]
draft: false
---

# How to set up Google in GPT Breeze (API key + custom model)

This guide shows how to connect **Google (Gemini)** to **GPT Breeze** with a BYOK workflow: add your API key as a credential, then create a custom model.

## TL;DR (2-minute setup)

1) Create a Google Gemini API key.

2) In **GPT Breeze → Settings → Credentials (Providers)**, add:
- **Provider type:** `google` (built-in)
- **Base URL:** leave default
- **API key:** paste your Gemini key

3) In **Custom Models → Add model**, add:
- **Model ID:** pick one from examples below
- **Display name:** label you’ll recognize
- **Credential:** select your Google credential

Provider/model selector demo: https://youtu.be/QS7TU0xuvDk

## What this provider is

Google (Gemini) is one of the providers you can connect to GPT Breeze in a **BYOM/BYOK** workflow.

- Provider docs: https://ai.google.dev/gemini-api/docs/pricing

## When to use Google (Gemini)

Use Google (Gemini) if you want:

- Gemini-family models in your toolbelt.
- A built-in provider type in GPT Breeze (simpler setup).
- A good fit for general summarization + writing workflows.

If you’re comparing cost tradeoffs across providers/models, start with [Pricing](/pricing) and the [AI model cost calculator](/ai-model-cost-calculator-and-price-comparation).

## Step 0 — Create an API key

Create a key in Google’s Gemini dashboard. Keep it private.

If you work with sensitive content, use [Privacy-first workflow](/privacy-first).

## Step 1 — Add credentials (provider / API key)

Open **GPT Breeze → Settings → Credentials (Providers)** and add a credential.

Fill these fields:

- **Name:** “Google Gemini”
- **Provider type:** **google** (built-in)
- **Base URL:** leave default
- **API key:** paste your Gemini key

## Step 2 — Add a custom model

Go to **Custom Models → Add model** and fill:

- **Model ID**: exact model identifier
- **Display name**: label you want to see
- **Credential**: select your Google credential

Free plan note: you can create **up to 2 custom models**.

## Example model IDs (from the model catalog)

Use these as **examples** (availability can change):

- `gemini-2.5-flash`
- `gemini-2.5-pro-preview-06-05`
- `gemini-embedding-001`

## Recommended starter model

For a fast everyday default:

- `gemini-2.5-flash`

## Troubleshooting

- **401/403**: key invalid/missing, billing/access not enabled.
- **404**: model ID wrong. Copy exactly.
- **429**: rate limit. Retry later.

## Next steps

- Compare approaches: [Pricing](/pricing)
- If you care about data boundaries: [Privacy-first workflow](/privacy-first)
- New here: [Getting started](/guide/getting-started/)
- Estimate costs: [AI model cost calculator](/ai-model-cost-calculator-and-price-comparation)
- Browse all providers: [/guide/providers/](/guide/providers/)
