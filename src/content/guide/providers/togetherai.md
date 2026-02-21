---
title: "How to set up Together AI in GPT Breeze (API key + custom model)"
description: "A practical setup guide to connect Together AI to GPT Breeze: add credentials, create a custom model, and avoid the common BYOK mistakes."
pubDate: 2026-02-20T00:00:00.000Z
updatedDate: 2026-02-21
topicId: "provider-togetherai"
tags: ["providers", "togetherai", "byom", "api-keys"]
draft: false
---

# How to set up Together AI in GPT Breeze (API key + custom model)

Connecting **Together AI** to GPT Breeze is simple in theory: paste a key, pick a model, done. In practice, most failures come from one of three things: the wrong base URL, the wrong model id, or a key that doesn’t have access. This guide is the “do this, not that” version.

## What people actually struggle with

- “I pasted my key but it still says 401/403.”
- “I get 404 — I’m sure the model exists.”
- “I don’t know what base URL to use.”

## TL;DR (2-minute setup)

1) Create an API key (treat it like a password).

2) In **GPT Breeze → Settings → Credentials (Providers)**, add a credential.

   - **Provider type:** Custom (OpenAI-compatible)
   - **Base URL:** `https://api.together.xyz/v1`
   - **API key:** your Together AI key

3) In **Custom Models → Add model**, add a model you can actually pick in the UI.
   - **Model ID:** a valid model id (examples below)

Provider/model selector demo: https://youtu.be/QS7TU0xuvDk

## What this provider is

Together AI is a provider you can connect to GPT Breeze as part of a BYOK/BYOM workflow.

- Provider docs: https://docs.together.ai/docs/serverless-models
- Common env vars (from our catalog): `TOGETHER_API_KEY`

## When to use it

- You want a large catalog of open models under one provider.
- You want cheaper/faster models for everyday workflows.

## Do it in GPT Breeze (30 seconds)

1) Add the credential (provider + key).
2) Add a custom model (so it appears in the model picker).
3) Use it in a shortcut (YouTube toolbar / page toolbar / text selection toolbar).

## Credentials: what to enter

Open **Settings → Credentials (Providers)** and fill:

- **Provider type:** Custom (OpenAI-compatible)
- **Base URL:** `https://api.together.xyz/v1`
- **API key:** your Together AI key

## Custom model: what to enter

Open **Custom Models → Add model**:

- **Model ID:** exact model id the API expects
- **Display name:** whatever you want to see in the picker
- **Credential:** select the credential you created

## Example model IDs

Use these as examples (availability changes):

- `moonshotai/Kimi-K2-Instruct`
- `moonshotai/Kimi-K2.5`
- `moonshotai/Kimi-K2-Instruct-0905`
- `moonshotai/Kimi-K2-Thinking`
- `essentialai/Rnj-1-Instruct`
- `MiniMaxAI/MiniMax-M2.5`
- `openai/gpt-oss-120b`
- `meta-llama/Llama-3.3-70B-Instruct-Turbo`
- `Qwen/Qwen3.5-397B-A17B`
- `Qwen/Qwen3-Coder-Next-FP8`

## Recommended starter model

If you just want to validate your setup quickly, start with: `meta-llama/Llama-3.1-8B-Instruct-Turbo`

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

## Next steps

- Browse all providers: [/guide/providers/](/guide/providers/)
- New here: [Getting started](/guide/getting-started/)
- Compare approaches: [Pricing](/pricing)
- If you care about data boundaries: [Privacy-first workflow](/privacy-first)
- Estimate costs: [AI model cost calculator](/ai-model-cost-calculator-and-price-comparation)

## Sources

- https://docs.together.ai/docs/serverless-models
