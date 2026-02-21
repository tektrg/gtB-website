---
title: "How to set up OpenAI in GPT Breeze (API key + custom model)"
description: "Step-by-step: add your OpenAI API credentials in GPT Breeze and create a custom model you can use for summaries, writing, and workflows."
pubDate: 2026-02-17
updatedDate: 2026-02-21
topicId: "provider-openai"
tags: ["providers", "openai", "byom", "api-keys"]
draft: false
---

# How to set up OpenAI in GPT Breeze (API key + custom model)

This guide shows how to connect **OpenAI** to **GPT Breeze** in a **BYOK/BYOM** workflow (Bring Your Own Key / Model): add your API key as a credential, then create a custom model you can actually use on YouTube and web pages.

## TL;DR (2-minute setup)

1) Get an OpenAI API key (keep it private).

2) In **GPT Breeze → Settings → Credentials (Providers)**, add:
- **Provider type:** `openai` (built-in)
- **Base URL:** leave default
- **API key:** paste your OpenAI key

3) In **Custom Models → Add model**, add:
- **Model ID:** pick one from the examples below
- **Display name:** whatever you want to see in the model picker
- **Credential:** select the OpenAI credential you created

If you want to see the provider/model selector UX: https://youtu.be/QS7TU0xuvDk

## What this provider is

OpenAI is a major AI provider with a large model lineup. GPT Breeze supports it as a **built-in** provider type.

- Provider docs: https://platform.openai.com/docs/models

## When to use OpenAI

Use OpenAI if you want:

- A straightforward “default” provider with lots of model choices.
- Strong general-purpose performance for summarizing + writing.
- The simplest setup path (built-in credential type in GPT Breeze).

If you’re optimizing for **cost predictability** and like comparing providers, see [Pricing](/pricing) and the [AI model cost calculator](/ai-model-cost-calculator-and-price-comparation).

## Step 0 — Create an API key (and treat it like a password)

Create an OpenAI API key in your OpenAI dashboard. Don’t paste it into screenshots, docs, or public issues.

If you want a stricter workflow for sensitive content, use [Privacy-first workflow](/privacy-first).

## Step 1 — Add credentials (provider / API key)

Open **GPT Breeze → Settings → Credentials (Providers)** and add a credential.

Fill these fields:

- **Name:** “OpenAI” (or “OpenAI – personal”)
- **Provider type:** **openai** (built-in)
- **Base URL:** leave default unless you know you need a custom endpoint
- **API key:** paste your OpenAI key

## Step 2 — Add a custom model

Then go to **Custom Models → Add model** and fill:

- **Model ID**: the exact model identifier the API expects
- **Display name**: a human-friendly name
- **Credential**: select the OpenAI credential from Step 1

Note: on the free plan, you can create **up to 2 custom models**.

## Example model IDs (from the model catalog)

Use these as **examples** (availability can change):

- `gpt-4o-mini`
- `gpt-4o-2024-11-20`
- `gpt-5-chat-latest`
- `codex-mini-latest`

## Recommended starter model

If you just want something that works for summaries + everyday writing, start with:

- `gpt-4o-mini`

## Troubleshooting

- **401/403**: your key is missing/invalid, or your account doesn’t have access. Re-check the key and plan.
- **404**: model ID is wrong. Copy the model ID exactly.
- **429**: rate limit. Try again later or switch to a smaller/faster model.

## FAQ

**Do I need a base URL for OpenAI?**
No—OpenAI is built-in, so the default base URL is fine for most users.

**Can I add multiple OpenAI keys?**
Yes. Many people separate “work” and “personal” keys so billing and usage are easier to track.

**Is BYOK safe?**
It can be—if you treat keys like passwords and follow a summarize-first + redaction habit. Start with [Privacy-first workflow](/privacy-first).

## Next steps

- Compare approaches: [Pricing](/pricing)
- New here: [Getting started](/guide/getting-started/)
- Estimate costs: [AI model cost calculator](/ai-model-cost-calculator-and-price-comparation)
- Browse all providers: [/guide/providers/](/guide/providers/)
