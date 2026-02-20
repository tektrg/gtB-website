---
title: "How to set up Azure in GPT Breeze (API key + custom model)"
description: "Step-by-step: add your Azure API credentials in GPT Breeze and create a custom model you can use for summaries, writing, and workflows."
pubDate: 2026-02-20
topicId: "provider-azure"
tags: ["providers", "azure", "byom", "api-keys"]
draft: false
---

# How to set up Azure in GPT Breeze (API key + custom model)

This guide shows how to use **Azure** with **GPT Breeze** by adding a credential (API key + base URL) and then creating a custom model.

## What this provider is

Azure is one of the providers you can connect to GPT Breeze as part of a **BYOM/BYOK** workflow (Bring Your Own Model / Bring Your Own Key).
- Provider docs: https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/models

## Step 1 — Add credentials (provider / API key)

Open **GPT Breeze → Settings → Credentials (Providers)** and add a credential.

- Provider type: **Custom (OpenAI-compatible)**
- Base URL: use the OpenAI-compatible endpoint provided by the vendor (see docs link above)
- API key: paste your **Azure** API key

**Notes:** this provider typically expects environment variables like:
- `AZURE_RESOURCE_NAME`
- `AZURE_API_KEY`

## Step 2 — Add a custom model

Then go to **Custom Models → Add model** and fill:

- **Model ID**: the exact model identifier the API expects
- **Display name**: a human-friendly name (this is what you’ll pick in the model selector)
- **Credential**: select the credential you created in Step 1

If you’re on the free plan, you can create **up to 2 custom models**.

## Example model IDs (from the model catalog)

Use these as **examples** (model availability can change):

- `gpt-5-codex`
- `gpt-5-pro`
- `phi-3-small-128k-instruct`
- `gpt-4o-mini`
- `text-embedding-ada-002`
- `grok-4-fast-reasoning`
- `gpt-5.1-codex-max`
- `phi-3-medium-128k-instruct`
- `phi-4-multimodal`
- `mai-ds-r1`

## Troubleshooting

- **401/403**: API key is missing/invalid, or your account has no access. Re-check the key and plan.
- **404**: model ID is wrong, or base URL is wrong. Copy model ID exactly from the provider dashboard.
- **429**: rate limit. Try a smaller model, wait, or upgrade the provider plan.

## Next steps

- Compare approaches: [Pricing](/pricing)
- If you care about data boundaries: [Privacy-first workflow](/privacy-first)
- New here: [Getting started](/guide/getting-started/)
- Estimate costs: [AI model cost calculator](/ai-model-cost-calculator-and-price-comparation)
