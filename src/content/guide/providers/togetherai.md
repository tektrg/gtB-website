---
title: "How to set up Together AI in GPT Breeze (API key + custom model)"
description: "Step-by-step: add your Together AI API credentials in GPT Breeze, create a custom model, and troubleshoot common BYOK errors."
pubDate: 2026-02-20T00:00:00.000Z
updatedDate: 2026-02-21
topicId: "provider-togetherai"
tags: ["providers", "togetherai", "byom", "api-keys"]
draft: false
---

# How to set up Together AI in GPT Breeze (API key + custom model)

This guide shows how to connect **Together AI** to **GPT Breeze** using a **BYOK/BYOM** workflow: add your API key as a credential, then create a custom model.

## TL;DR (2-minute setup)

1) Create a **Together AI API key**.

2) In **GPT Breeze → Settings → Credentials (Providers)**, add:
- **Provider type:** Custom (OpenAI-compatible)
- **Base URL:** `https://api.together.xyz/v1`
- **API key:** paste your Together key

3) In **Custom Models → Add model**, add:
- **Model ID:** pick one from the examples below
- **Display name:** label you’ll recognize
- **Credential:** select the Together credential you created

Provider/model selector demo: https://youtu.be/QS7TU0xuvDk

## What this provider is

Together AI is a provider with a large catalog of open models.

- Provider docs: https://docs.together.ai/docs/serverless-models

## When to use Together AI

Use Together AI if you want:

- A broad catalog to experiment quickly (many open models).
- A practical “cheap/fast” provider for everyday summaries and rewriting.

If your main goal is “one endpoint for many models,” OpenRouter is often the simplest: [/guide/providers/openrouter/](/guide/providers/openrouter/).

## Step 0 — Create an API key

Create a key in the Together dashboard. Treat it like a password.

If you work with sensitive content, follow [Privacy-first workflow](/privacy-first).

## Step 1 — Add credentials (Custom / OpenAI-compatible)

Open **GPT Breeze → Settings → Credentials (Providers)** and add a credential:

- **Name:** “Together AI”
- **Provider type:** **Custom (OpenAI-compatible)**
- **Base URL:** `https://api.together.xyz/v1`
- **API key:** paste your Together key

## Step 2 — Add a custom model

Go to **Custom Models → Add model** and fill:

- **Model ID**: exact model identifier
- **Display name**: human-friendly label
- **Credential**: select your Together credential

Free plan note: you can create **up to 2 custom models**.

## Example model IDs

Use these as examples (availability changes):

- `deepseek-ai/DeepSeek-V3`
- `deepseek-ai/DeepSeek-R1`
- `moonshotai/Kimi-K2-Instruct`
- `Qwen/Qwen2.5-72B-Instruct-Turbo`
- `meta-llama/Llama-3.1-8B-Instruct-Turbo`

## Recommended starter model

If you want a dependable default for summaries and drafting:

- `meta-llama/Llama-3.1-8B-Instruct-Turbo`

## Troubleshooting

- **401/403**: key invalid/missing or account access issue.
- **404**: model ID wrong (copy exactly) or base URL wrong.
- **429**: rate limit — retry later or pick a smaller model.

## Next steps

- Compare approaches: [Pricing](/pricing)
- If you care about data boundaries: [Privacy-first workflow](/privacy-first)
- New here: [Getting started](/guide/getting-started/)
- Estimate costs: [AI model cost calculator](/ai-model-cost-calculator-and-price-comparation)
- Browse all providers: [/guide/providers/](/guide/providers/)
