---
title: "How to use Amazon Bedrock with GPT Breeze (recommended setup)"
description: "A practical guide to use Amazon Bedrock with GPT Breeze: what’s different about Bedrock auth, and the safest way to connect it in a BYOK workflow."
pubDate: 2026-02-21T00:00:00.000Z
updatedDate: 2026-02-21
topicId: "provider-amazon-bedrock"
tags: ["providers", "amazon-bedrock", "byom", "api-keys"]
draft: false
---

# How to use Amazon Bedrock with GPT Breeze (recommended setup)

Amazon Bedrock is powerful, but it’s **not a simple “paste an API key + base URL” provider**.

Bedrock requests are typically authenticated with **AWS credentials + SigV4 signing**.

So the most reliable way to use Bedrock in GPT Breeze today is usually:

- Connect Bedrock **through an OpenAI-compatible gateway/proxy** that handles signing, then point GPT Breeze at that gateway.

## What this provider is

Amazon Bedrock is AWS’s managed model platform (Anthropic, Meta, Amazon Titan, Cohere, etc.).

- Provider docs: https://docs.aws.amazon.com/bedrock/latest/userguide/models-supported.html

## When to use Amazon Bedrock

Use Bedrock if:

- You’re already on AWS and want AWS-native billing/governance.
- You need Bedrock-only models or regional availability.

## Recommended setup (practical)

### Option A (recommended): Use an OpenAI-compatible gateway

Run a gateway that:

- accepts OpenAI-style requests
- signs and forwards them to Bedrock

Then in GPT Breeze:

1) **Credentials (Providers)**
- **Provider type:** Custom (OpenAI-compatible)
- **Base URL:** your gateway URL (example: `https://YOUR_GATEWAY.example.com/v1`)
- **API key:** whatever your gateway uses (or leave empty if it doesn’t require one)

2) **Custom Models → Add model**
- **Model ID:** the Bedrock model ID you want to route to (or your gateway’s model alias)

This keeps GPT Breeze simple and moves AWS complexity to the gateway.

### Option B: Direct Bedrock (only if GPT Breeze supports SigV4)

If GPT Breeze adds native Bedrock auth, you’ll typically need:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`

(These are also the required environment vars in our provider catalog.)

## Example Bedrock model IDs

Model IDs look like:

- `us.anthropic.claude-opus-4-20250514-v1:0`
- `meta.llama3-1-70b-instruct-v1:0`
- `amazon.titan-text-express-v1`

(Availability is region-dependent.)

## Troubleshooting

- **403 / signature errors**: you’re hitting Bedrock without SigV4 signing.
- **AccessDenied**: your AWS account/role lacks Bedrock permissions or the model isn’t enabled.
- **Region mismatch**: model isn’t available in the selected region.

## Next steps

- Compare approaches: [Pricing](/pricing)
- If you care about data boundaries: [Privacy-first workflow](/privacy-first)
- New here: [Getting started](/guide/getting-started/)
- Browse all providers: [/guide/providers/](/guide/providers/)
