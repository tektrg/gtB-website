---
title: "How to set up Amazon Bedrock in GPT Breeze (API key + custom model)"
description: "A practical setup guide to connect Amazon Bedrock to GPT Breeze: add credentials, create a custom model, and avoid the common BYOK mistakes."
pubDate: 2026-02-21T00:00:00.000Z
updatedDate: 2026-02-21
topicId: "provider-amazon-bedrock"
tags: ["providers", "amazon-bedrock", "byom", "api-keys"]
draft: false
---

# How to set up Amazon Bedrock in GPT Breeze (API key + custom model)

Connecting **Amazon Bedrock** to GPT Breeze is simple in theory: paste a key, pick a model, done. In practice, most failures come from one of three things: the wrong base URL, the wrong model id, or a key that doesn’t have access. This guide is the “do this, not that” version.

## What people actually struggle with

- “I pasted my key but it still says 401/403.”
- “I get 404 — I’m sure the model exists.”
- “I don’t know what base URL to use.”
- “Bedrock isn’t just an API key — why is everything failing?”

## TL;DR (2-minute setup)

1) Create an API key (treat it like a password).

2) In **GPT Breeze → Settings → Credentials (Providers)**, add a credential.

   - Bedrock usually needs AWS SigV4 signing. The practical setup is to use an OpenAI-compatible **gateway/proxy** that handles signing, then point GPT Breeze to that gateway.

3) In **Custom Models → Add model**, add a model you can actually pick in the UI.
   - **Model ID:** a valid model id (examples below)

Provider/model selector demo: https://youtu.be/QS7TU0xuvDk

## What this provider is

Amazon Bedrock is AWS’s managed model platform (Anthropic, Meta, Amazon Titan, Cohere, etc.).

- Provider docs: https://docs.aws.amazon.com/bedrock/latest/userguide/models-supported.html
- Common env vars (from our catalog): `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`

## When to use it

- You’re already deep in AWS and want AWS governance/billing for models.
- You want Bedrock-only availability or regional model access.

## Do it in GPT Breeze (30 seconds)

1) Add the credential (provider + key).
2) Add a custom model (so it appears in the model picker).
3) Use it in a shortcut (YouTube toolbar / page toolbar / text selection toolbar).

## Credentials: what to enter

Open **Settings → Credentials (Providers)** and fill:

- **Recommended:** use a gateway/proxy and put the gateway URL in **Base URL**.
- Bedrock auth is not “paste a key”; it’s usually AWS credentials + SigV4 signing.

## Custom model: what to enter

Open **Custom Models → Add model**:

- **Model ID:** exact model id the API expects
- **Display name:** whatever you want to see in the picker
- **Credential:** select the credential you created

## Example model IDs

Use these as examples (availability changes):

- `us.anthropic.claude-sonnet-4-5-20250929-v1:0`
- `cohere.command-r-plus-v1:0`
- `anthropic.claude-v2`
- `anthropic.claude-3-7-sonnet-20250219-v1:0`
- `anthropic.claude-sonnet-4-20250514-v1:0`
- `qwen.qwen3-coder-30b-a3b-v1:0`
- `google.gemma-3-4b-it`
- `minimax.minimax-m2`
- `zai.glm-4.7`
- `meta.llama3-2-11b-instruct-v1:0`

## Recommended starter model

If you just want to validate your setup quickly, start with: `us.anthropic.claude-sonnet-4-5-20250929-v1:0`

## Prompt templates (copy/paste)

```text
Summarize this into:
- TL;DR (5 bullets)
- Key takeaways
- Action items
- Questions to verify
Keep it skimmable.
```

```text
Rewrite this for clarity.
Constraints:
- keep facts the same
- remove fluff
- output as a numbered checklist
```

## Common errors (and the real fix)

- **401/403**: key invalid/missing, or your account/project doesn’t have access. Create a new key and ensure billing/access is enabled.
- **404**: model ID is wrong, or base URL is wrong. Copy the model ID exactly.
- **429**: rate limit — retry later, or use a smaller model.
- **Signature / AccessDenied**: you are hitting Bedrock without SigV4 signing or without Bedrock permissions.

## Next steps

- Browse all providers: [/guide/providers/](/guide/providers/)
- New here: [Getting started](/guide/getting-started/)
- Compare approaches: [Pricing](/pricing)
- If you care about data boundaries: [Privacy-first workflow](/privacy-first)
- Estimate costs: [AI model cost calculator](/ai-model-cost-calculator-and-price-comparation)

## Sources

- https://docs.aws.amazon.com/bedrock/latest/userguide/models-supported.html
