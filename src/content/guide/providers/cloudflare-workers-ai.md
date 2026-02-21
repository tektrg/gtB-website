---
title: "How to set up Cloudflare Workers AI in GPT Breeze (API key + base URL)"
description: "Step-by-step: connect Cloudflare Workers AI to GPT Breeze using a Custom (OpenAI-compatible) credential, then add a model ID from the @cf catalog."
pubDate: 2026-02-21T00:00:00.000Z
updatedDate: 2026-02-21
topicId: "provider-cloudflare-workers-ai"
tags: ["providers", "cloudflare-workers-ai", "byom", "api-keys"]
draft: false
---

# How to set up Cloudflare Workers AI in GPT Breeze (API key + base URL)

This guide shows how to connect **Cloudflare Workers AI** to **GPT Breeze** using a **BYOK/BYOM** workflow: add your Cloudflare credential (account + key), then add a model ID from the `@cf/...` catalog.

## TL;DR (2-minute setup)

1) Get your **Cloudflare Account ID** and an API key/token that can call Workers AI.

2) In **GPT Breeze → Settings → Credentials (Providers)**, add:
- **Provider type:** Custom (OpenAI-compatible)
- **Base URL:** `https://api.cloudflare.com/client/v4/accounts/YOUR_ACCOUNT_ID/ai/v1`
- **API key:** your Cloudflare API key/token

3) In **Custom Models → Add model**, add:
- **Model ID:** an `@cf/...` model (examples below)
- **Display name:** label you’ll recognize
- **Credential:** select the Cloudflare credential

Provider/model selector demo: https://youtu.be/QS7TU0xuvDk

## What this provider is

Cloudflare Workers AI lets you run models on Cloudflare’s edge infrastructure.

- Provider docs: https://developers.cloudflare.com/workers-ai/models/
- Base URL pattern: `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/ai/v1`

## When to use Cloudflare Workers AI

Use it if:

- You already use Cloudflare and want to keep everything in one platform.
- You want a catalog of smaller models that are easy to call.

## Step 0 — Get Account ID + API key/token

You’ll need:

- `CLOUDFLARE_ACCOUNT_ID`
- an API key/token

Treat the token like a password.

## Step 1 — Add credentials (Custom / OpenAI-compatible)

Open **GPT Breeze → Settings → Credentials (Providers)** and add:

- **Name:** “Cloudflare Workers AI”
- **Provider type:** **Custom (OpenAI-compatible)**
- **Base URL:** `https://api.cloudflare.com/client/v4/accounts/YOUR_ACCOUNT_ID/ai/v1`
- **API key:** paste your Cloudflare key/token

## Step 2 — Add a custom model

Go to **Custom Models → Add model**:

- **Model ID**: exact model identifier (from Cloudflare catalog)
- **Display name**: human-friendly label
- **Credential**: select your Cloudflare credential

## Example model IDs

- `@cf/facebook/bart-large-cnn`
- `@cf/mistral/mistral-7b-instruct-v0.1`
- `@cf/deepseek-ai/deepseek-r1-distill-qwen-32b`
- `@cf/baai/bge-large-en-v1.5`

## Troubleshooting

- **401/403**: token invalid/missing or wrong permissions.
- **404**: model ID wrong or base URL wrong (wrong account id).
- **429**: rate limited.

## Next steps

- Compare approaches: [Pricing](/pricing)
- If you care about data boundaries: [Privacy-first workflow](/privacy-first)
- New here: [Getting started](/guide/getting-started/)
- Browse all providers: [/guide/providers/](/guide/providers/)
