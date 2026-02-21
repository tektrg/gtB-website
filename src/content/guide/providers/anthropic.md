---
title: "How to set up Anthropic in GPT Breeze (API key + custom model)"
description: "Step-by-step: add your Anthropic API credentials in GPT Breeze and create a custom model you can use for summaries, writing, and workflows."
pubDate: 2026-02-17
updatedDate: 2026-02-21
topicId: "provider-anthropic"
tags: ["providers", "anthropic", "byom", "api-keys"]
draft: false
---

# How to set up Anthropic in GPT Breeze (API key + custom model)

This guide shows how to connect **Anthropic (Claude)** to **GPT Breeze** using a **BYOK/BYOM** workflow: add your API key as a credential, then create a custom model for summaries and writing.

## TL;DR (2-minute setup)

1) Create an Anthropic API key.

2) In **GPT Breeze → Settings → Credentials (Providers)**, add:
- **Provider type:** `anthropic` (built-in)
- **Base URL:** leave default
- **API key:** paste your Anthropic key

3) In **Custom Models → Add model**, add:
- **Model ID:** pick one from the examples below
- **Display name:** what you want to see in the picker
- **Credential:** select the Anthropic credential you created

Provider/model selector demo: https://youtu.be/QS7TU0xuvDk

## What this provider is

Anthropic makes the Claude family of models. GPT Breeze supports it as a built-in provider type.

- Provider docs: https://docs.anthropic.com/en/docs/about-claude/models

## When to use Anthropic

Use Anthropic if you want:

- A provider that’s popular for careful writing and high-quality summarization.
- A clean, built-in setup in GPT Breeze.
- A BYOK workflow where you control the key and can switch providers later.

If you’re comparing subscription tools vs BYOK, start at [Pricing](/pricing).

## Step 0 — Create an API key

Create a key in the Anthropic dashboard. Treat it like a password.

If you handle sensitive text, follow [Privacy-first workflow](/privacy-first).

## Step 1 — Add credentials (provider / API key)

Open **GPT Breeze → Settings → Credentials (Providers)** and add a credential.

Fill these fields:

- **Name:** “Anthropic” (or “Anthropic – work”)
- **Provider type:** **anthropic** (built-in)
- **Base URL:** leave default unless you know you need a custom endpoint
- **API key:** paste your Anthropic key

## Step 2 — Add a custom model

Go to **Custom Models → Add model** and fill:

- **Model ID**: exact model identifier
- **Display name**: human-friendly label
- **Credential**: select your Anthropic credential

Free plan note: you can create **up to 2 custom models**.

## Example model IDs (from the model catalog)

Use these as **examples** (availability can change):

- `claude-3-5-haiku-latest`
- `claude-3-5-sonnet-20241022`
- `claude-opus-4-1`

## Recommended starter model

If you want a good default for daily writing + summaries:

- `claude-3-5-haiku-latest`

## Troubleshooting

- **401/403**: key invalid/missing, or account access issue.
- **404**: model ID is wrong. Copy it exactly.
- **429**: rate limit. Retry later or switch model.

## FAQ

**Do I need a base URL?**
Usually no—Anthropic is built-in, so default settings are fine.

**Can I use multiple providers at once?**
Yes. Many users keep multiple credentials so they can switch models/providers for different workflows.

## Next steps

- Compare approaches: [Pricing](/pricing)
- If you care about data boundaries: [Privacy-first workflow](/privacy-first)
- New here: [Getting started](/guide/getting-started/)
- Estimate costs: [AI model cost calculator](/ai-model-cost-calculator-and-price-comparation)
- Browse all providers: [/guide/providers/](/guide/providers/)
