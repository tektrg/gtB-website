---
title: "How to set up Azure OpenAI in GPT Breeze (endpoint + deployment)"
description: "Step-by-step: connect Azure OpenAI to GPT Breeze using a Custom (OpenAI-compatible) credential, including the endpoint format and deployment/model mapping."
pubDate: 2026-02-20T00:00:00.000Z
updatedDate: 2026-02-21
topicId: "provider-azure"
tags: ["providers", "azure", "byom", "api-keys"]
draft: false
---

# How to set up Azure OpenAI in GPT Breeze (endpoint + deployment)

Azure OpenAI is “OpenAI models on Azure,” but the setup has one big difference:

- On Azure, you typically call a **deployment** you created in your Azure resource.

So the credential looks like “endpoint + key,” and the model you add in GPT Breeze is usually your **deployment name**.

## TL;DR (2-minute setup)

1) Create an **Azure OpenAI** resource + deploy a model.

2) In **GPT Breeze → Settings → Credentials (Providers)**, add:
- **Provider type:** Custom (OpenAI-compatible)
- **Base URL:** your Azure endpoint **up to** `/openai/deployments`
  - Example: `https://YOUR_RESOURCE_NAME.openai.azure.com/openai/deployments`
- **API key:** your Azure API key

3) In **Custom Models → Add model**, use:
- **Model ID:** your **deployment name** (not “gpt-4o-mini” unless that’s literally your deployment name)
- **Display name:** whatever you want
- **Credential:** your Azure credential

Provider/model selector demo: https://youtu.be/QS7TU0xuvDk

## What this provider is

Azure OpenAI lets you run OpenAI-family models through Azure infrastructure and Azure billing.

- Provider docs: https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/models

## When to use Azure OpenAI

Use Azure OpenAI if:

- Your company already standardized on Azure.
- You need Azure governance/compliance controls.
- You want to keep billing and infra in Azure.

## Step 0 — Create a deployment

In Azure Portal:

1) Create an Azure OpenAI resource.
2) Deploy a model.
3) Copy:
   - the **endpoint**
   - the **API key**
   - your **deployment name**

## Step 1 — Add credentials (Custom / OpenAI-compatible)

Open **GPT Breeze → Settings → Credentials (Providers)** and add a credential:

- **Name:** “Azure OpenAI”
- **Provider type:** **Custom (OpenAI-compatible)**
- **Base URL:** `https://YOUR_RESOURCE_NAME.openai.azure.com/openai/deployments`
- **API key:** paste your Azure key

Important note: Azure uses an `api-version` parameter under the hood. If your requests fail with version errors, you may need to use a gateway/proxy that injects the required `api-version`, or use the specific Azure-compatible configuration if/when GPT Breeze adds it.

## Step 2 — Add a custom model (deployment name)

Go to **Custom Models → Add model**:

- **Model ID**: your Azure **deployment name**
- **Display name**: human-friendly label
- **Credential**: select your Azure credential

## Troubleshooting

- **401/403**: wrong key or wrong resource.
- **404**: deployment name wrong, or base URL missing `/openai/deployments`.
- **api-version error**: your Azure configuration requires a specific API version.

## Next steps

- Compare approaches: [Pricing](/pricing)
- New here: [Getting started](/guide/getting-started/)
- If you care about data boundaries: [Privacy-first workflow](/privacy-first)
- Browse all providers: [/guide/providers/](/guide/providers/)
