---
title: "How to set up Amazon Bedrock in GPT Breeze (API key + custom model)"
description: "Step-by-step: add your Amazon Bedrock API credentials in GPT Breeze and create a custom model you can use for summaries, writing, and workflows."
pubDate: 2026-02-21T00:00:00+07:00
topicId: "provider-amazon-bedrock"
tags: ["providers", "amazon-bedrock", "byom", "api-keys"]
draft: false
---

# How to set up Amazon Bedrock in GPT Breeze (API key + custom model)

This guide shows how to use **Amazon Bedrock** with **GPT Breeze** by adding a credential (API key + base URL) and then creating a custom model.

## What this provider is

Amazon Bedrock is one of the providers you can connect to GPT Breeze as part of a **BYOM/BYOK** workflow (Bring Your Own Model / Bring Your Own Key).
- Provider docs: [https://docs.aws.amazon.com/bedrock/latest/userguide/models-supported.html](https://docs.aws.amazon.com/bedrock/latest/userguide/models-supported.html)

## When to use it

- You already use Amazon Bedrock and want to keep your GPT Breeze setup consistent.
- You want more control over cost and model choice via BYOM/BYOK.

## Step 1 — Add credentials (provider / API key)

Open **GPT Breeze → Settings → Credentials (Providers)** and add a credential.

- Provider type: **Custom (OpenAI-compatible)**
- Base URL: use the OpenAI-compatible endpoint provided by the vendor (see docs link above)
- API key: paste your **Amazon Bedrock** API key

**Notes:** this provider typically expects environment variables like:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`

## Step 2 — Add a custom model

Then go to **Custom Models → Add model** and fill:

- **Model ID**: the exact model identifier the API expects
- **Display name**: a human-friendly name (this is what you’ll pick in the model selector)
- **Credential**: select the credential you created in Step 1

If you’re on the free plan, you can create **up to 2 custom models**.

## Example model IDs (from the model catalog)

Use these as **examples** (model availability can change):

- `deepseek.r1-v1:0`
- `meta.llama3-1-70b-instruct-v1:0`
- `anthropic.claude-instant-v1`
- `amazon.titan-text-express-v1`
- `qwen.qwen3-coder-480b-a35b-v1:0`
- `eu.anthropic.claude-sonnet-4-6`
- `cohere.command-r-v1:0`
- `eu.anthropic.claude-haiku-4-5-20251001-v1:0`
- `openai.gpt-oss-120b-1:0`
- `us.anthropic.claude-opus-4-20250514-v1:0`

## Troubleshooting

- **401/403**: API key is missing/invalid, or your account has no access. Re-check the key and plan.
- **404**: model ID is wrong, or base URL is wrong. Copy model ID exactly from the provider dashboard.
- **429**: rate limit. Try a smaller model, wait, or upgrade the provider plan.

## Next steps

- Compare approaches: [Pricing](/pricing)
- If you care about data boundaries: [Privacy-first workflow](/privacy-first)
- New here: [Getting started](/guide/getting-started/)
- Estimate costs: [AI model cost calculator](/ai-model-cost-calculator-and-price-comparation)
