---
title: "How to set up Nvidia in GPT Breeze (API key + custom model)"
description: "A practical setup guide to connect Nvidia to GPT Breeze: add credentials, create a custom model, and avoid the common BYOK mistakes."
pubDate: 2026-03-01T00:00:00.000Z
updatedDate: 2026-03-01
topicId: "provider-nvidia"
tags: ["providers", "nvidia", "byom", "api-keys"]
draft: false
---

# How to set up Nvidia in GPT Breeze (API key + custom model)

Connecting **Nvidia** to GPT Breeze is simple in theory: paste a key, pick a model, done. In practice, most failures come from one of three things: the wrong base URL, the wrong model id, or a key that doesn’t have access. This guide is the “do this, not that” version.

## What people actually struggle with

- “I pasted my key but it still says 401/403.”
- “I get 404 — I’m sure the model exists.”
- “I don’t know what base URL to use.”

## TL;DR (2-minute setup)

1) Create an API key (treat it like a password).

2) In **GPT Breeze → Settings → Credentials (Providers)**, add a credential.

   - **Provider type:** Custom (OpenAI-compatible)
   - **Base URL:** `https://integrate.api.nvidia.com/v1`
   - **API key:** your Nvidia key

3) In **Custom Models → Add model**, add a model you can actually pick in the UI.
   - **Model ID:** a valid model id (examples below)

Provider/model selector demo: https://youtu.be/QS7TU0xuvDk

## What this provider is

Nvidia is a provider you can connect to GPT Breeze as part of a BYOK/BYOM workflow.

- Provider docs: https://docs.api.nvidia.com/nim/
- Common env vars (from our catalog): `NVIDIA_API_KEY`

## When to use it

- You already use Nvidia and want to keep your GPT Breeze setup consistent.
- You want more control over cost and model choice via BYOM/BYOK.

## Do it in GPT Breeze (30 seconds)

1) Add the credential (provider + key).
2) Add a custom model (so it appears in the model picker).
3) Use it in a shortcut (YouTube toolbar / page toolbar / text selection toolbar).

## Credentials: what to enter

Open **Settings → Credentials (Providers)** and fill:

- **Provider type:** Custom (OpenAI-compatible)
- **Base URL:** `https://integrate.api.nvidia.com/v1`
- **API key:** your Nvidia key

## Custom model: what to enter

Open **Custom Models → Add model**:

- **Model ID:** exact model id the API expects
- **Display name:** whatever you want to see in the picker
- **Credential:** select the credential you created

## Example model IDs

Use these as examples (availability changes):

- `moonshotai/kimi-k2.5`
- `moonshotai/kimi-k2-instruct-0905`
- `moonshotai/kimi-k2-thinking`
- `moonshotai/kimi-k2-instruct`
- `nvidia/nvidia-nemotron-nano-9b-v2`
- `nvidia/cosmos-nemotron-34b`
- `nvidia/llama-embed-nemotron-8b`
- `nvidia/nemotron-3-nano-30b-a3b`
- `nvidia/parakeet-tdt-0.6b-v2`
- `nvidia/nemoretriever-ocr-v1`

## Recommended starter model

If you just want to validate your setup quickly, start with: `moonshotai/kimi-k2.5`

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

- https://docs.api.nvidia.com/nim/
