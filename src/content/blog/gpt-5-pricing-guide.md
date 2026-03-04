---
title: "GPT-5 pricing (input/output per 1M tokens)"
description: "Current OpenAI pricing for GPT-5: input $1.25/1M tokens, output $10/1M — plus a quick way to estimate your bill in GPT Breeze."
pubDate: 2026-03-04T00:00:00.000Z
topicId: "model-pricing-openai-gpt-5"
tags: ["pricing", "models", "openai", "gpt-5"]
faq:
  - q: "How much does GPT-5 cost?"
    a: "List price is $1.25/1M input tokens and $10/1M output tokens (USD)."
  - q: "What’s the difference between input and output tokens?"
    a: "Input tokens are what you send (prompt + system instructions + pasted text/context). Output tokens are what the model generates in its reply."
  - q: "Why does output usually cost more?"
    a: "Providers typically price output higher because generating long responses is compute-heavy. You can often reduce cost by asking for structured, shorter outputs."
  - q: "How do I estimate my monthly cost quickly?"
    a: "Multiply your input/output token totals by the per‑1M prices. If you don’t know tokens, start with the calculator and a few real examples from your workflow."
  - q: "How do I reduce hallucinations without spending more?"
    a: "Use a map-first workflow (structured summary), verify only the 2–3 claims you’ll act on, and keep the model’s job small and specific."
draft: false
---

# GPT-5 pricing (input/output per 1M tokens)

If you use AI daily, pricing isn’t “finance stuff” — it’s product behavior. When a model is expensive, you summarize less, you ask fewer follow-ups, and you stop using AI for the small tasks that actually compound.

This page is the **current price sheet** for **GPT-5** (provider: **OpenAI**) and a practical way to estimate costs in GPT Breeze using your own usage pattern.

## Quick pricing (USD per 1M tokens)

| Item | Price | Notes |
|---|---:|---|
| Input tokens | $1.25 / 1M | Prompt + system + context |
| Output tokens | $10 / 1M | Model responses |
| Cache read | $0.13 / 1M | If provider supports cached inputs |

## Context window and limits

- Context window: **400K tokens**
- Max output: **128K tokens**
- Modalities: input **text, image** → output **text**

## Cost examples (so you can sanity-check fast)

These are ballpark estimates using the provider’s list price. Your real bill depends on your actual token counts and whether caching applies.

- **100k input + 20k output** ≈ $0.33 (input $0.13 + output $0.20)
- **1M input + 200k output** ≈ $3.25 (input $1.25 + output $2)

If you want to estimate *your* workflows (summaries vs long chat vs extraction), use the calculator: [/ai-model-cost-calculator-and-price-comparation](/ai-model-cost-calculator-and-price-comparation)

## Token math (the 60-second version)

Most “pricing confusion” is really “token confusion”. A simple mental model:
- **Input tokens** = everything you send (your prompt + system instructions + pasted text + prior context)
- **Output tokens** = what the model writes back

Quick estimate formula:

```text
cost ≈ (inputTokens / 1,000,000) * inputPrice + (outputTokens / 1,000,000) * outputPrice
```

If you don’t know your token counts, start with the calculator and calibrate with 2–3 real tasks you do weekly.

## When this model is worth it (and when it isn’t)

High-end models are great — but only if you give them the right job. Use this model when you need:
- multi-step planning / reasoning
- high-stakes writing you’ll reuse
- deep analysis on messy inputs

Use a cheaper model when you just need:
- first-pass summaries
- extraction into a fixed template
- quick rewrites and formatting

## Cost control tips (that don’t reduce quality)

- **Ask for structure** (bullets/tables) instead of long prose.
- **Map first, deep dive second**: summarize into sections, then expand only 2–5 sections.
- **Trim context**: don’t paste everything; paste only the relevant section + a short goal.
- **Use caching when available** for repeated system instructions or boilerplate inputs.

## How to use this model in GPT Breeze (fast setup)

1) Ensure you’ve set up your provider + key (BYOK/BYOM).
2) Select this model in your GPT Breeze settings (or in your shortcut’s model setting, if you use per-shortcut routing).
3) Use the “cheap-first, deep-dive-second” workflow:
   - Run a cheaper/faster model for the first summary pass
   - Switch to a stronger model only for the 2–5 sections you’ll reuse or publish

Start here if you haven’t configured the extension: [/guide/getting-started/](/guide/getting-started/)

## What to do next (internal links)

- Compare model costs side-by-side: [/ai-model-cost-calculator-and-price-comparation](/ai-model-cost-calculator-and-price-comparation)
- Learn the core workflow (timestamps + follow-ups): [/youtube-summary](/youtube-summary)
- Read about privacy boundaries: [/privacy-first](/privacy-first)
- Plan selection + usage: [/pricing](/pricing)

## FAQ

### Is the calculator better than a static price page?
Yes for *your* usage. This page is the “price sheet”; the calculator is the tool you use to estimate your real workflow cost (summaries vs long chat vs extraction).

### Why do my costs feel higher than expected?
Common causes: you’re sending a lot of hidden context (chat history), you’re asking for long outputs, or you’re re-sending the same instructions repeatedly instead of using caching/shortcuts.

### Should I always use the newest model?
Not always. New models can be great, but the best ROI often comes from routing: cheap models for first-pass work, premium models only when the output will be reused or published.

### Where do these prices come from?
We read pricing fields from GPT Breeze’s model catalog. Always cross-check with the provider docs for billing-critical decisions.

## Data source + freshness

Pricing data is pulled from GPT Breeze’s internal model catalog (`src/data/models-api.json`) on **2026-03-04**. Providers change prices; if this page looks stale, check the calculator and the provider’s official docs.

