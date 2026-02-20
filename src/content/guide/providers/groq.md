---
title: "How to set up Groq in GPT Breeze (API key + custom model)"
description: "Step-by-step: add your Groq API credentials in GPT Breeze and create a custom model you can use for summaries, writing, and workflows."
pubDate: 2026-02-19
updatedDate: 2026-02-20
topicId: "provider-groq"
tags: ["providers", "groq", "byom", "api-keys"]
draft: false
---

# How to set up Groq in GPT Breeze (API key + custom model)

This guide shows how to use **Groq** with **GPT Breeze** by adding a credential (API key + base URL) and then creating a custom model.

## TL;DR (2-minute setup)

1) Create a Groq API key.

2) In **GPT Breeze → Settings → Credentials (Providers)**, add:
- **Provider type:** Custom (OpenAI-compatible)
- **Base URL:** use Groq’s OpenAI-compatible endpoint (from Groq docs)
- **API key:** paste your Groq key

3) In **Custom Models → Add model**, add:
- **Model ID:** pick one from examples below
- **Display name:** label you’ll recognize
- **Credential:** select your Groq credential

Provider/model selector demo: https://youtu.be/QS7TU0xuvDk

## What this provider is

Groq is one of the providers you can connect to GPT Breeze as part of a **BYOM/BYOK** workflow.

- Provider docs: https://console.groq.com/docs/models

## When to use Groq

Use Groq if you want:

- Very fast responses for summarization and quick iterations.
- An OpenAI-compatible API style (works well with “Custom” credentials).
- A good fit for high-volume workflows like summarizing many videos/pages.

## Step 0 — Create an API key

Create a key in the Groq dashboard and keep it private.

## Step 1 — Add credentials (Custom / OpenAI-compatible)

Open **GPT Breeze → Settings → Credentials (Providers)** and add a credential.

Fill these fields:

- **Name:** “Groq”
- **Provider type:** **Custom (OpenAI-compatible)**
- **Base URL:** from Groq docs (OpenAI-compatible)
- **API key:** paste your Groq key

## Step 2 — Add a custom model

Go to **Custom Models → Add model**:

- **Model ID**: exact model identifier
- **Display name**: label you want to see
- **Credential**: select your Groq credential

Free plan note: you can create **up to 2 custom models**.

## Example model IDs (from the model catalog)

Use these as **examples** (availability can change):

- `llama-3.1-8b-instant`
- `llama3-70b-8192`
- `llama-3.3-70b-versatile`
- `qwen-qwq-32b`

## Recommended starter model

If you want a fast default to validate your setup:

- `llama-3.1-8b-instant`

## Troubleshooting

- **401/403**: key invalid/missing.
- **404**: base URL wrong or model ID wrong.
- **429**: rate limit. Retry later.

## Next steps

- Compare approaches: [Pricing](/pricing)
- If you care about data boundaries: [Privacy-first workflow](/privacy-first)
- New here: [Getting started](/guide/getting-started/)
- Estimate costs: [AI model cost calculator](/ai-model-cost-calculator-and-price-comparation)
- Browse all providers: [/guide/providers/](/guide/providers/)
