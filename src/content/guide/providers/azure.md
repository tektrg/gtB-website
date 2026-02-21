---
title: "How to set up Azure OpenAI in GPT Breeze (endpoint + deployment)"
description: "Step-by-step: connect Azure OpenAI to GPT Breeze using a Custom (OpenAI-compatible) credential, including endpoint format and deployment/model mapping."
pubDate: 2026-02-20T00:00:00.000Z
updatedDate: 2026-02-21
topicId: "provider-azure"
tags: ["providers", "azure", "byom", "api-keys"]
draft: false
---

# How to set up Azure OpenAI in GPT Breeze (endpoint + deployment)

Azure OpenAI setup trips people up because the “model” you call is usually your **deployment name**, not the vendor model id. This page gives you the fast path (and the failure modes) so you don’t burn an hour on 404s.

## What people actually struggle with

- “I pasted my key but it still says 401/403.”
- “I get 404 — I’m sure the model exists.”
- “I don’t know what base URL to use.”
- “Azure wants a deployment name — where do I put that?”

## TL;DR (2-minute setup)

1) Create an API key (treat it like a password).

2) In **GPT Breeze → Settings → Credentials (Providers)**, add a credential.

   - **Provider type:** Custom (OpenAI-compatible)
   - **Base URL:** `https://YOUR_RESOURCE_NAME.openai.azure.com/openai/deployments`
   - **API key:** your Azure API key

3) In **Custom Models → Add model**, add a model you can actually pick in the UI.
   - **Model ID:** your Azure **deployment name**

Provider/model selector demo: https://youtu.be/QS7TU0xuvDk

## What this provider is

Azure OpenAI is OpenAI-family models served through Azure infrastructure and Azure billing/governance.

- Provider docs: https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/models
- Common env vars (from our catalog): `AZURE_RESOURCE_NAME`, `AZURE_API_KEY`

## When to use it

- You need Azure governance/billing and your org standardized on Azure.
- You already have Azure OpenAI deployments and want to use them in GPT Breeze.

## Do it in GPT Breeze (30 seconds)

1) Add the credential (provider + key).
2) Add a custom model (so it appears in the model picker).
3) Use it in a shortcut (YouTube toolbar / page toolbar / text selection toolbar).

## Credentials: what to enter

Open **Settings → Credentials (Providers)** and fill:

- **Provider type:** Custom (OpenAI-compatible)
- **Base URL:** `https://YOUR_RESOURCE_NAME.openai.azure.com/openai/deployments`
- **API key:** your Azure key

## Custom model: what to enter

Open **Custom Models → Add model**:

- **Model ID:** your Azure **deployment name**
- **Why:** Azure routes requests by deployment, not by raw vendor model id.
- **Display name:** whatever you want to see in the picker
- **Credential:** select the credential you created

## Example model IDs

Use these as examples (availability changes):

- `gpt-4.1-nano`
- `text-embedding-3-small`
- `grok-4-fast-non-reasoning`
- `deepseek-r1-0528`
- `grok-4-fast-reasoning`
- `phi-3-medium-128k-instruct`
- `gpt-4`
- `claude-opus-4-1`
- `gpt-5.2-chat`
- `llama-3.2-11b-vision-instruct`

## Recommended starter model

If you just want to validate your setup quickly, start with: `gpt-4.1-nano`

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
- **404**: usually wrong deployment name or base URL missing `/openai/deployments`.
- **429**: rate limit — retry later, or use a smaller model.

## Next steps

- Browse all providers: [/guide/providers/](/guide/providers/)
- New here: [Getting started](/guide/getting-started/)
- Compare approaches: [Pricing](/pricing)
- If you care about data boundaries: [Privacy-first workflow](/privacy-first)
- Estimate costs: [AI model cost calculator](/ai-model-cost-calculator-and-price-comparation)

## Sources

- https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/models
