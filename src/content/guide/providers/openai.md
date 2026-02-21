---
title: "How to set up OpenAI in GPT Breeze (API key + custom model)"
description: "A practical setup guide to connect OpenAI to GPT Breeze: add credentials, create a custom model, and avoid the common BYOK mistakes."
pubDate: 2026-02-17T00:00:00.000Z
updatedDate: 2026-02-21
topicId: "provider-openai"
tags: ["providers", "openai", "byom", "api-keys"]
draft: false
---

# How to set up OpenAI in GPT Breeze (API key + custom model)

Connecting **OpenAI** to GPT Breeze is simple in theory: paste a key, pick a model, done. In practice, most failures come from one of three things: the wrong base URL, the wrong model id, or a key that doesn’t have access. This guide is the “do this, not that” version.

## What people actually struggle with

- “I pasted my key but it still says 401/403.”
- “I get 404 — I’m sure the model exists.”

## TL;DR (2-minute setup)

1) Create an API key (treat it like a password).

2) In **GPT Breeze → Settings → Credentials (Providers)**, add a credential.

   - **Provider type:** `openai` (built-in)
   - **Base URL:** leave default
   - **API key:** your OpenAI key

3) In **Custom Models → Add model**, add a model you can actually pick in the UI.
   - **Model ID:** a valid model id (examples below)

Provider/model selector demo: https://youtu.be/QS7TU0xuvDk

## What this provider is

OpenAI is a provider you can connect to GPT Breeze as part of a BYOK/BYOM workflow.

- Provider docs: https://platform.openai.com/docs/models
- Common env vars (from our catalog): `OPENAI_API_KEY`

## When to use it

- You want the widest compatibility and a “default” provider that just works.
- You’re optimizing for strong general performance across summaries + writing.

## Do it in GPT Breeze (30 seconds)

1) Add the credential (provider + key).
2) Add a custom model (so it appears in the model picker).
3) Use it in a shortcut (YouTube toolbar / page toolbar / text selection toolbar).

## Credentials: what to enter

Open **Settings → Credentials (Providers)** and fill:

- **Provider type:** openai (built-in)
- **Base URL:** default
- **API key:** your OpenAI key

## Custom model: what to enter

Open **Custom Models → Add model**:

- **Model ID:** exact model id the API expects
- **Display name:** whatever you want to see in the picker
- **Credential:** select the credential you created

## Example model IDs

Use these as examples (availability changes):

- `gpt-4.1-nano`
- `text-embedding-3-small`
- `gpt-5.3-codex-spark`
- `gpt-4`
- `o1-pro`
- `gpt-4o-2024-05-13`
- `gpt-5.2-codex`
- `gpt-5.1-codex`
- `gpt-4o-2024-08-06`
- `gpt-4.1-mini`

## Recommended starter model

If you just want to validate your setup quickly, start with: `gpt-4o-mini`

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

- https://platform.openai.com/docs/models
