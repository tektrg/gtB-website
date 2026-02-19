---
title: "How to set up OpenAI in GPT Breeze (API key + custom model)"
description: "Step-by-step: add your OpenAI API credentials in GPT Breeze and create a custom model you can use for summaries, writing, and workflows."
pubDate: 2026-02-17
updatedDate: 2026-02-19
topicId: "provider-openai"
tags: ["providers", "openai", "byom", "api-keys"]
draft: false
---

# How to set up OpenAI in GPT Breeze (API key + custom model)

This guide shows how to use **OpenAI** with **GPT Breeze** by adding a credential (API key + base URL) and then creating a custom model.

## What this provider is

OpenAI is one of the providers you can connect to GPT Breeze as part of a **BYOM/BYOK** workflow (Bring Your Own Model / Bring Your Own Key).
- Provider docs: https://platform.openai.com/docs/models

## When to use OpenAI

Use OpenAI if you want:

- A straightforward “default” provider with a large model lineup.
- Strong general-purpose performance for writing + summarization.
- A simple setup flow (built-in credential type in GPT Breeze).

If you’re mainly optimizing for **cost predictability** across many providers/models, also consider a router approach and compare tradeoffs on [Pricing](/pricing) and the [AI model cost calculator](/ai-model-cost-calculator-and-price-comparation).

## Step 1 — Add credentials (provider / API key)

Open **GPT Breeze → Settings → Credentials (Providers)** and add a credential.

- Provider type: **openai** (built-in)
- Base URL: leave default unless you know you need a custom endpoint
- API key: paste your **OpenAI** API key

**Notes:** this provider typically expects environment variables like:
- `OPENAI_API_KEY`

## Step 2 — Add a custom model

Then go to **Custom Models → Add model** and fill:

- **Model ID**: the exact model identifier the API expects
- **Display name**: a human-friendly name (this is what you’ll pick in the model selector)
- **Credential**: select the credential you created in Step 1

If you’re on the free plan, you can create **up to 2 custom models**.

## Example model IDs (from the model catalog)

Use these as **examples** (model availability can change):

- `gpt-4o-2024-11-20`
- `gpt-5.3-codex`
- `gpt-5-codex`
- `gpt-5-pro`
- `gpt-4o-mini`
- `text-embedding-ada-002`
- `gpt-5-chat-latest`
- `codex-mini-latest`
- `gpt-5.1-codex-max`
- `gpt-4o-2024-05-13`

## Troubleshooting

- **401/403**: API key is missing/invalid, or your account has no access. Re-check the key and plan.
- **404**: model ID is wrong, or base URL is wrong. Copy model ID exactly from the provider dashboard.
- **429**: rate limit. Try a smaller model, wait, or upgrade the provider plan.

## Next steps

- Compare approaches: [Pricing](/pricing)
- If you care about data boundaries: [Privacy-first workflow](/privacy-first)
- New here: [Getting started](/guide/getting-started/)
- Estimate costs: [AI model cost calculator](/ai-model-cost-calculator-and-price-comparation)
