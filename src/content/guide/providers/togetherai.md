---
title: "How to set up Together AI in GPT Breeze (API key + custom model)"
description: "Step-by-step: add your Together AI API credentials in GPT Breeze and create a custom model you can use for summaries, writing, and workflows."
pubDate: 2026-02-20T00:00:00+07:00
topicId: "provider-togetherai"
tags: ["providers", "togetherai", "byom", "api-keys"]
draft: false
---

# How to set up Together AI in GPT Breeze (API key + custom model)

This guide shows how to use **Together AI** with **GPT Breeze** by adding a credential (API key + base URL) and then creating a custom model.

## What this provider is

Together AI is one of the providers you can connect to GPT Breeze as part of a **BYOM/BYOK** workflow (Bring Your Own Model / Bring Your Own Key).
- Provider docs: [https://docs.together.ai/docs/serverless-models](https://docs.together.ai/docs/serverless-models)

## When to use it

- You want a big catalog of open models under one provider (good for experimentation).
- You want cheaper/faster models for everyday summaries, drafting, and rewriting.
- If you need a single “default” provider that’s maximally compatible across everything, start with OpenAI/Anthropic/Google or use OpenRouter.

## Step 1 — Add credentials (provider / API key)

Open **GPT Breeze → Settings → Credentials (Providers)** and add a credential.

- Provider type: **Custom (OpenAI-compatible)**
- Base URL: use the OpenAI-compatible endpoint provided by the vendor (see docs link above)
- API key: paste your **Together AI** API key

**Notes:** this provider typically expects environment variables like:
- `TOGETHER_API_KEY`

## Step 2 — Add a custom model

Then go to **Custom Models → Add model** and fill:

- **Model ID**: the exact model identifier the API expects
- **Display name**: a human-friendly name (this is what you’ll pick in the model selector)
- **Credential**: select the credential you created in Step 1

If you’re on the free plan, you can create **up to 2 custom models**.

## Example model IDs (from the model catalog)

Use these as **examples** (model availability can change):

- `zai-org/GLM-4.6`
- `zai-org/GLM-4.7`
- `zai-org/GLM-5`
- `essentialai/Rnj-1-Instruct`
- `MiniMaxAI/MiniMax-M2.5`
- `deepseek-ai/DeepSeek-V3-1`
- `deepseek-ai/DeepSeek-R1`
- `deepseek-ai/DeepSeek-V3`
- `moonshotai/Kimi-K2-Instruct`
- `moonshotai/Kimi-K2-Instruct-0905`

## Troubleshooting

- **401/403**: API key is missing/invalid, or your account has no access. Re-check the key and plan.
- **404**: model ID is wrong, or base URL is wrong. Copy model ID exactly from the provider dashboard.
- **429**: rate limit. Try a smaller model, wait, or upgrade the provider plan.

## Next steps

- Compare approaches: [Pricing](/pricing)
- If you care about data boundaries: [Privacy-first workflow](/privacy-first)
- New here: [Getting started](/guide/getting-started/)
- Estimate costs: [AI model cost calculator](/ai-model-cost-calculator-and-price-comparation)
