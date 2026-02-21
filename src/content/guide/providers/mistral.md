---
title: "How to set up Mistral in GPT Breeze (API key + custom model)"
description: "Step-by-step: add your Mistral API credentials in GPT Breeze, create a custom model, and troubleshoot common BYOK errors."
pubDate: 2026-02-20T00:00:00.000Z
updatedDate: 2026-02-21
topicId: "provider-mistral"
tags: ["providers", "mistral", "byom", "api-keys"]
draft: false
---

# How to set up Mistral in GPT Breeze (API key + custom model)

This guide shows how to connect **Mistral** to **GPT Breeze** using a **BYOK/BYOM** workflow: add your API key as a credential, then create a custom model you can actually select when summarizing YouTube videos and web pages.

## TL;DR (2-minute setup)

1) Create a **Mistral API key**.

2) In **GPT Breeze → Settings → Credentials (Providers)**, add:
- **Provider type:** Custom (OpenAI-compatible)
- **Base URL:** `https://api.mistral.ai/v1`
- **API key:** paste your Mistral key

3) In **Custom Models → Add model**, add:
- **Model ID:** pick one from the examples below
- **Display name:** whatever you want in the model picker
- **Credential:** select the Mistral credential you created

Provider/model selector demo: https://youtu.be/QS7TU0xuvDk

## What this provider is

Mistral is an AI provider with a mix of general and code-focused models.

- Provider docs: https://docs.mistral.ai/getting-started/models/

## When to use Mistral

Use Mistral if you want:

- A strong **EU/OSS-friendly** provider option.
- Good everyday models for summarization + drafting.
- A provider you can switch in/out of your stack without changing your workflow.

If you’re comparing cost tradeoffs across providers and models, start with [Pricing](/pricing) and the [AI model cost calculator](/ai-model-cost-calculator-and-price-comparation).

## Step 0 — Create an API key (treat it like a password)

Create a key in the Mistral dashboard. Don’t paste it into screenshots, docs, or public issues.

If you work with sensitive content, follow [Privacy-first workflow](/privacy-first).

## Step 1 — Add credentials (Custom / OpenAI-compatible)

Open **GPT Breeze → Settings → Credentials (Providers)** and add a credential.

Fill these fields:

- **Name:** “Mistral” (or “Mistral – work”)
- **Provider type:** **Custom (OpenAI-compatible)**
- **Base URL:** `https://api.mistral.ai/v1`
- **API key:** paste your Mistral key

## Step 2 — Add a custom model

Go to **Custom Models → Add model**:

- **Model ID**: the exact model identifier the API expects
- **Display name**: human-friendly label
- **Credential**: select your Mistral credential

Free plan note: you can create **up to 2 custom models**.

## Example model IDs

Use these as examples (availability changes):

- `mistral-small-2506`
- `mistral-medium-2505`
- `mistral-large-2512`
- `codestral-latest`
- `ministral-8b-latest`

## Recommended starter model

If you just want a solid default for summaries + writing:

- `mistral-small-2506`

## Troubleshooting

- **401/403**: key invalid/missing or account access issue.
- **404**: model ID is wrong (copy exactly from the provider) or base URL is wrong.
- **429**: rate limit — retry later or switch to a smaller model.

## FAQ

**Do I need a base URL?**
Yes for Custom providers. Use the OpenAI-compatible base URL: `https://api.mistral.ai/v1`.

**Can I add multiple Mistral keys?**
Yes. Many people separate work vs personal keys so billing is easier to track.

## Next steps

- Compare approaches: [Pricing](/pricing)
- If you care about data boundaries: [Privacy-first workflow](/privacy-first)
- New here: [Getting started](/guide/getting-started/)
- Estimate costs: [AI model cost calculator](/ai-model-cost-calculator-and-price-comparation)
- Browse all providers: [/guide/providers/](/guide/providers/)
