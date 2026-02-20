---
title: "How to set up OpenRouter in GPT Breeze (API key + custom model)"
description: "Step-by-step: add your OpenRouter API credentials in GPT Breeze and create a custom model you can use for summaries, writing, and workflows."
pubDate: 2026-02-19
updatedDate: 2026-02-20
topicId: "provider-openrouter"
tags: ["providers", "openrouter", "byom", "api-keys"]
draft: false
---

# How to set up OpenRouter in GPT Breeze (API key + custom model)

This guide shows how to connect **OpenRouter** to **GPT Breeze**. OpenRouter is useful because it gives you **one endpoint** that can route to many different models.

## TL;DR (2-minute setup)

1) Create an OpenRouter API key.

2) In **GPT Breeze → Settings → Credentials (Providers)**, add:
- **Provider type:** `openrouter` (built-in)
- **Base URL:** `https://openrouter.ai/api/v1`
- **API key:** paste your OpenRouter key

3) In **Custom Models → Add model**, add:
- **Model ID:** pick one from examples below
- **Display name:** label you’ll recognize
- **Credential:** select your OpenRouter credential

Provider/model selector demo: https://youtu.be/QS7TU0xuvDk

## What this provider is

OpenRouter is a router/provider you can connect to GPT Breeze as part of a BYOK workflow.

- Provider docs: https://openrouter.ai/models
- API base URL (from catalog): `https://openrouter.ai/api/v1`

## When to use OpenRouter

Use OpenRouter if you want:

- One key + one endpoint to access many models.
- A practical way to test models without setting up 5 different providers.
- An easy “switch models often” workflow.

If you care about cost tradeoffs across models/providers, see [Pricing](/pricing) and the [AI model cost calculator](/ai-model-cost-calculator-and-price-comparation).

## Step 0 — Create an API key

Create a key in your OpenRouter dashboard. Keep it private.

## Step 1 — Add credentials

Open **GPT Breeze → Settings → Credentials (Providers)** and add a credential:

- **Name:** “OpenRouter”
- **Provider type:** **openrouter**
- **Base URL:** `https://openrouter.ai/api/v1`
- **API key:** paste your key

## Step 2 — Add a custom model

Go to **Custom Models → Add model**:

- **Model ID**: exact model identifier
- **Display name**: label you want to see
- **Credential**: select your OpenRouter credential

Free plan note: you can create **up to 2 custom models**.

## Example model IDs (from the model catalog)

Use these as **examples** (availability can change):

- `allenai/molmo-2-8b:free`
- `nvidia/nemotron-nano-9b-v2:free`
- `microsoft/mai-ds-r1:free`
- `featherless/qwerky-72b`

## Recommended starter model

If you want a cheap/default test model to validate your setup:

- `nvidia/nemotron-nano-9b-v2:free`

## Troubleshooting

- **401/403**: key invalid/missing, or account access issue.
- **404**: model ID wrong (copy exactly) or base URL wrong.
- **429**: rate limit. Retry later or pick a smaller model.

## Next steps

- Compare approaches: [Pricing](/pricing)
- New here: [Getting started](/guide/getting-started/)
- Estimate costs: [AI model cost calculator](/ai-model-cost-calculator-and-price-comparation)
- Browse all providers: [/guide/providers/](/guide/providers/)
