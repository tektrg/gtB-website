---
title: "How to set up Anthropic in GPT Breeze (API key + custom model)"
description: "Step-by-step: add your Anthropic API credentials in GPT Breeze and create a custom model you can use for summaries, writing, and workflows."
pubDate: 2026-02-17
tags: ["providers", "anthropic", "byom", "api-keys"]
draft: false
---

# How to set up Anthropic in GPT Breeze (API key + custom model)

This guide shows how to use **Anthropic** with **GPT Breeze** by adding a credential (API key + base URL) and then creating a custom model.

## What this provider is

Anthropic is one of the providers you can connect to GPT Breeze as part of a **BYOM/BYOK** workflow (Bring Your Own Model / Bring Your Own Key).
- Provider docs: https://docs.anthropic.com/en/docs/about-claude/models

## Step 1 — Add credentials (provider / API key)

Open **GPT Breeze → Settings → Credentials (Providers)** and add a credential.

- Provider type: **anthropic** (built-in)
- Base URL: leave default unless you know you need a custom endpoint
- API key: paste your **Anthropic** API key

**Notes:** this provider typically expects environment variables like:
- `ANTHROPIC_API_KEY`

## Step 2 — Add a custom model

Then go to **Custom Models → Add model** and fill:

- **Model ID**: the exact model identifier the API expects
- **Display name**: a human-friendly name (this is what you’ll pick in the model selector)
- **Credential**: select the credential you created in Step 1

If you’re on the free plan, you can create **up to 2 custom models**.

## Example model IDs (from the model catalog)

Use these as **examples** (model availability can change):

- `claude-opus-4-5-20251101`
- `claude-3-5-haiku-latest`
- `claude-opus-4-1`
- `claude-3-5-sonnet-20241022`
- `claude-3-sonnet-20240229`
- `claude-opus-4-6`
- `claude-sonnet-4-0`
- `claude-opus-4-20250514`
- `claude-sonnet-4-5-20250929`
- `claude-opus-4-0`

## Troubleshooting

- **401/403**: API key is missing/invalid, or your account has no access. Re-check the key and plan.
- **404**: model ID is wrong, or base URL is wrong. Copy model ID exactly from the provider dashboard.
- **429**: rate limit. Try a smaller model, wait, or upgrade the provider plan.

## Next steps

- Compare approaches: `/pricing`
- If you care about data boundaries: `/privacy-first`
- New here: `/guide/getting-started/`
- Estimate costs: `/ai-model-cost-calculator-and-price-comparation`
