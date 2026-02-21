---
title: "How to set up Cloudflare Workers AI in GPT Breeze (API key + custom model)"
description: "Step-by-step: add your Cloudflare Workers AI API credentials in GPT Breeze and create a custom model you can use for summaries, writing, and workflows."
pubDate: 2026-02-21T00:00:00+07:00
topicId: "provider-cloudflare-workers-ai"
tags: ["providers", "cloudflare-workers-ai", "byom", "api-keys"]
draft: false
---

# How to set up Cloudflare Workers AI in GPT Breeze (API key + custom model)

This guide shows how to use **Cloudflare Workers AI** with **GPT Breeze** by adding a credential (API key + base URL) and then creating a custom model.

## What this provider is

Cloudflare Workers AI is one of the providers you can connect to GPT Breeze as part of a **BYOM/BYOK** workflow (Bring Your Own Model / Bring Your Own Key).
- Provider docs: [https://developers.cloudflare.com/workers-ai/models/](https://developers.cloudflare.com/workers-ai/models/)
- API base URL (from catalog): `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/ai/v1`

## When to use it

- You already use Cloudflare Workers AI and want to keep your GPT Breeze setup consistent.
- You want more control over cost and model choice via BYOM/BYOK.

## Step 1 — Add credentials (provider / API key)

Open **GPT Breeze → Settings → Credentials (Providers)** and add a credential.

- Provider type: **Custom (OpenAI-compatible)**
- Base URL: `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/ai/v1` (from our catalog; verify in the vendor docs if it changes)
- API key: paste your **Cloudflare Workers AI** API key

**Notes:** this provider typically expects environment variables like:
- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_KEY`

## Step 2 — Add a custom model

Then go to **Custom Models → Add model** and fill:

- **Model ID**: the exact model identifier the API expects
- **Display name**: a human-friendly name (this is what you’ll pick in the model selector)
- **Credential**: select the credential you created in Step 1

If you’re on the free plan, you can create **up to 2 custom models**.

## Example model IDs (from the model catalog)

Use these as **examples** (model availability can change):

- `@cf/ibm-granite/granite-4.0-h-micro`
- `@cf/baai/bge-small-en-v1.5`
- `@cf/baai/bge-large-en-v1.5`
- `@cf/baai/bge-reranker-base`
- `@cf/baai/bge-m3`
- `@cf/baai/bge-base-en-v1.5`
- `@cf/pfnet/plamo-embedding-1b`
- `@cf/deepseek-ai/deepseek-r1-distill-qwen-32b`
- `@cf/facebook/bart-large-cnn`
- `@cf/mistral/mistral-7b-instruct-v0.1`

## Troubleshooting

- **401/403**: API key is missing/invalid, or your account has no access. Re-check the key and plan.
- **404**: model ID is wrong, or base URL is wrong. Copy model ID exactly from the provider dashboard.
- **429**: rate limit. Try a smaller model, wait, or upgrade the provider plan.

## Next steps

- Compare approaches: [Pricing](/pricing)
- If you care about data boundaries: [Privacy-first workflow](/privacy-first)
- New here: [Getting started](/guide/getting-started/)
- Estimate costs: [AI model cost calculator](/ai-model-cost-calculator-and-price-comparation)
