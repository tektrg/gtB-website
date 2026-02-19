---
title: "How to set up OpenRouter in GPT Breeze (API key + custom model)"
description: "Step-by-step: add your OpenRouter API credentials in GPT Breeze and create a custom model you can use for summaries, writing, and workflows."
pubDate: 2026-02-19
updatedDate: 2026-02-19
topicId: "provider-openrouter"
tags: ["providers", "openrouter", "byom", "api-keys"]
draft: false
---

# How to set up OpenRouter in GPT Breeze (API key + custom model)

This guide shows how to use **OpenRouter** with **GPT Breeze** by adding a credential (API key + base URL) and then creating a custom model.

## What this provider is

OpenRouter is a router/provider you can connect to GPT Breeze as part of a **BYOM/BYOK** workflow (Bring Your Own Model / Bring Your Own Key).
- Provider docs: https://openrouter.ai/models
- API base URL (from catalog): `https://openrouter.ai/api/v1`

## When to use OpenRouter

Use OpenRouter if you want:

- One key + one endpoint that can access many different models.
- A practical way to **test and switch models** without reconfiguring multiple providers.
- A BYOK workflow where you control the key.

It’s also a good fit if you frequently compare outputs (summaries, writing, research) across models. For cost tradeoffs, see [Pricing](/pricing) and the [AI model cost calculator](/ai-model-cost-calculator-and-price-comparation).

## Step 1 — Add credentials (provider / API key)

Open **GPT Breeze → Settings → Credentials (Providers)** and add a credential.

- Provider type: **openrouter** (built-in)
- Base URL: leave default unless you know you need a custom endpoint
- API key: paste your **OpenRouter** API key

**Notes:** this provider typically expects environment variables like:
- `OPENROUTER_API_KEY`

## Step 2 — Add a custom model

Then go to **Custom Models → Add model** and fill:

- **Model ID**: the exact model identifier the API expects
- **Display name**: a human-friendly name (this is what you’ll pick in the model selector)
- **Credential**: select the credential you created in Step 1

If you’re on the free plan, you can create **up to 2 custom models**.

## Example model IDs (from the model catalog)

Use these as **examples** (model availability can change):

- `featherless/qwerky-72b`
- `allenai/molmo-2-8b:free`
- `nvidia/nemotron-nano-9b-v2:free`
- `nvidia/nemotron-nano-12b-v2-vl:free`
- `nvidia/nemotron-3-nano-30b-a3b:free`
- `nvidia/nemotron-nano-9b-v2`
- `arcee-ai/trinity-large-preview:free`
- `arcee-ai/trinity-mini:free`
- `xiaomi/mimo-v2-flash`
- `microsoft/mai-ds-r1:free`

## Troubleshooting

- **401/403**: API key is missing/invalid, or your account has no access. Re-check the key and plan.
- **404**: model ID is wrong, or base URL is wrong. Copy model ID exactly from the provider dashboard.
- **429**: rate limit. Try a smaller model, wait, or upgrade the provider plan.

## Next steps

- Compare approaches: [Pricing](/pricing)
- If you care about data boundaries: [Privacy-first workflow](/privacy-first)
- New here: [Getting started](/guide/getting-started/)
- Estimate costs: [AI model cost calculator](/ai-model-cost-calculator-and-price-comparation)
