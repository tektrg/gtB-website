import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const modelsPath = path.join(root, 'src', 'data', 'models-api.json');
const blogDir = path.join(root, 'src', 'content', 'blog');
const stateDir = path.join(root, 'AUTONOMUS', 'state');
const statePath = path.join(stateDir, 'published-model-pricing.jsonl');

function toISODate(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function normalizePubDate(dateStr) {
  if (!dateStr) return `${toISODate(new Date())}T00:00:00.000Z`;
  if (String(dateStr).includes('T')) return dateStr;
  return `${dateStr}T00:00:00.000Z`;
}

function escapeQuotes(s) {
  return String(s ?? '').replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function slugify(input) {
  return String(input)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 120);
}

function fmtMoney(n) {
  if (n === null || n === undefined || Number.isNaN(Number(n))) return '—';
  const v = Number(n);
  // Keep small values readable.
  if (v >= 1) return `$${v.toFixed(2).replace(/\.00$/, '')}`;
  if (v >= 0.1) return `$${v.toFixed(2)}`;
  return `$${v.toFixed(3).replace(/0+$/, '').replace(/\.$/, '')}`;
}

function fmtTokens(n) {
  if (!n && n !== 0) return '—';
  const v = Number(n);
  if (!Number.isFinite(v)) return '—';
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (v >= 1_000) return `${Math.round(v / 1_000)}K`;
  return String(v);
}

function parseArgs(argv) {
  const args = {
    dryRun: false,
    date: null,
    provider: null,
    model: null,
    update: false,
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--dry-run') args.dryRun = true;
    else if (a === '--date') args.date = argv[++i];
    else if (a === '--provider') args.provider = argv[++i];
    else if (a === '--model') args.model = argv[++i];
    else if (a === '--update') args.update = true;
    else throw new Error(`Unknown arg: ${a}`);
  }
  return args;
}

function loadModelsApi() {
  const raw = fs.readFileSync(modelsPath, 'utf8');
  return JSON.parse(raw);
}

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function loadPublishedSet() {
  if (!fs.existsSync(statePath)) return new Set();
  const lines = fs
    .readFileSync(statePath, 'utf8')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  const out = new Set();
  for (const l of lines) {
    try {
      const j = JSON.parse(l);
      if (j?.key) out.add(String(j.key));
    } catch {
      // ignore
    }
  }
  return out;
}

function appendPublished(entry) {
  ensureDir(stateDir);
  const line = JSON.stringify(entry);
  fs.appendFileSync(statePath, line + '\n', 'utf8');
}

function modelHasCompletePricing(m) {
  const c = m?.cost;
  if (!c) return false;
  // We only publish pages where we can show a real input/output price.
  if (!Number.isFinite(Number(c.input)) || !Number.isFinite(Number(c.output))) return false;
  if (Number(c.input) <= 0 || Number(c.output) <= 0) return false;
  return true;
}

function isTextModel(m) {
  const out = m?.modalities?.output;
  if (Array.isArray(out) && out.includes('text')) return true;
  return false;
}

function isEmbeddingLike(m) {
  const id = String(m?.id ?? '');
  const family = String(m?.family ?? '');
  if (family.includes('embedding')) return true;
  if (id.includes('embedding')) return true;
  return false;
}

function pickCandidates({ data, allowProviders, onlyProvider, onlyModel }) {
  const candidates = [];
  for (const providerKey of Object.keys(data)) {
    if (!allowProviders.has(providerKey)) continue;
    if (onlyProvider && providerKey !== onlyProvider) continue;

    const provider = data[providerKey];
    const models = provider?.models;
    if (!models || typeof models !== 'object') continue;

    for (const modelId of Object.keys(models)) {
      if (onlyModel && modelId !== onlyModel) continue;
      const m = models[modelId];
      if (!m) continue;
      if (!isTextModel(m)) continue;
      if (isEmbeddingLike(m)) continue;
      if (!modelHasCompletePricing(m)) continue;

      const rel = m.release_date ? Date.parse(m.release_date) : 0;
      const upd = m.last_updated ? Date.parse(m.last_updated) : 0;
      candidates.push({ providerKey, provider, modelId, model: m, rel, upd });
    }
  }

  // Sort: newest release date first, then last updated.
  candidates.sort((a, b) => (b.rel - a.rel) || (b.upd - a.upd));
  return candidates;
}

function chooseNext({ candidates, published, forced, providerPriority, modelPriorityByProvider }) {
  if (forced) return forced;

  // Group by provider (candidates are already sorted newest-first).
  const byProvider = new Map();
  for (const c of candidates) {
    if (!byProvider.has(c.providerKey)) byProvider.set(c.providerKey, []);
    byProvider.get(c.providerKey).push(c);
  }

  const providers = providerPriority.length
    ? providerPriority.filter((p) => byProvider.has(p))
    : Array.from(byProvider.keys());

  // 1) Try preferred models first (per provider).
  for (const p of providers) {
    const prefs = modelPriorityByProvider[p] || [];
    const list = byProvider.get(p) || [];
    for (const modelId of prefs) {
      const hit = list.find((c) => c.modelId === modelId);
      if (!hit) continue;
      const key = `${hit.providerKey}:${hit.modelId}`;
      if (!published.has(key)) return hit;
    }
  }

  // 2) Fallback: newest not-yet-published per provider, in provider priority order.
  for (const p of providers) {
    const list = byProvider.get(p) || [];
    for (const c of list) {
      const key = `${c.providerKey}:${c.modelId}`;
      if (!published.has(key)) return c;
    }
  }

  // 3) Last resort: any provider, any model.
  for (const c of candidates) {
    const key = `${c.providerKey}:${c.modelId}`;
    if (!published.has(key)) return c;
  }

  return null;
}

function computeExampleCost({ inputPerM, outputPerM, inputTokens, outputTokens }) {
  const inputCost = (Number(inputTokens) / 1_000_000) * Number(inputPerM);
  const outputCost = (Number(outputTokens) / 1_000_000) * Number(outputPerM);
  return { inputCost, outputCost, total: inputCost + outputCost };
}

function renderPricingGuide({ providerKey, providerName, modelId, model, pubDate, dataDate }) {
  const cost = model.cost;

  const title = `${model.name || modelId} pricing (input/output per 1M tokens)`;
  const description = `Current ${providerName} pricing for ${model.name || modelId}: input ${fmtMoney(cost.input)}/1M tokens, output ${fmtMoney(cost.output)}/1M — plus a quick way to estimate your bill in GPT Breeze.`;

  const slug = `${slugify(modelId)}-pricing-guide`;

  const topicId = `model-pricing-${providerKey}-${slugify(modelId)}`;

  const cacheRead = cost.cache_read;
  const cacheWrite = cost.cache_write;

  const ctx = model.limit?.context ?? model.limit?.input ?? null;
  const outLimit = model.limit?.output ?? null;

  const ex1 = computeExampleCost({ inputPerM: cost.input, outputPerM: cost.output, inputTokens: 100_000, outputTokens: 20_000 });
  const ex2 = computeExampleCost({ inputPerM: cost.input, outputPerM: cost.output, inputTokens: 1_000_000, outputTokens: 200_000 });

  const lines = [];
  lines.push('---');
  lines.push(`title: "${escapeQuotes(title)}"`);
  lines.push(`description: "${escapeQuotes(description)}"`);
  lines.push(`pubDate: ${normalizePubDate(pubDate)}`);
  lines.push(`topicId: "${escapeQuotes(topicId)}"`);
  lines.push(`tags: ["pricing", "models", "${escapeQuotes(providerKey)}", "${escapeQuotes(slugify(modelId))}"]`);
  lines.push('faq:');
  lines.push(`  - q: "How much does ${escapeQuotes(model.name || modelId)} cost?"`);
  lines.push(`    a: "List price is ${fmtMoney(cost.input)}/1M input tokens and ${fmtMoney(cost.output)}/1M output tokens (USD)."`);
  lines.push('  - q: "What’s the difference between input and output tokens?"');
  lines.push('    a: "Input tokens are what you send (prompt + system instructions + pasted text/context). Output tokens are what the model generates in its reply."');
  lines.push('  - q: "Why does output usually cost more?"');
  lines.push('    a: "Providers typically price output higher because generating long responses is compute-heavy. You can often reduce cost by asking for structured, shorter outputs."');
  lines.push('  - q: "How do I estimate my monthly cost quickly?"');
  lines.push('    a: "Multiply your input/output token totals by the per‑1M prices. If you don’t know tokens, start with the calculator and a few real examples from your workflow."');
  lines.push('  - q: "How do I reduce hallucinations without spending more?"');
  lines.push('    a: "Use a map-first workflow (structured summary), verify only the 2–3 claims you’ll act on, and keep the model’s job small and specific."');
  lines.push('draft: false');
  lines.push('---');
  lines.push('');

  lines.push(`# ${title}`);
  lines.push('');
  lines.push(
    `If you use AI daily, pricing isn’t “finance stuff” — it’s product behavior. When a model is expensive, you summarize less, you ask fewer follow-ups, and you stop using AI for the small tasks that actually compound.`,
  );
  lines.push('');
  lines.push(
    `This page is the **current price sheet** for **${model.name || modelId}** (provider: **${providerName}**) and a practical way to estimate costs in GPT Breeze using your own usage pattern.`,
  );
  lines.push('');

  lines.push('## Quick pricing (USD per 1M tokens)');
  lines.push('');
  lines.push('| Item | Price | Notes |');
  lines.push('|---|---:|---|');
  lines.push(`| Input tokens | ${fmtMoney(cost.input)} / 1M | Prompt + system + context |`);
  lines.push(`| Output tokens | ${fmtMoney(cost.output)} / 1M | Model responses |`);
  if (Number.isFinite(Number(cacheRead))) {
    lines.push(`| Cache read | ${fmtMoney(cacheRead)} / 1M | If provider supports cached inputs |`);
  }
  if (Number.isFinite(Number(cacheWrite)) && Number(cacheWrite) > 0) {
    lines.push(`| Cache write | ${fmtMoney(cacheWrite)} / 1M | If provider charges to write cache |`);
  }
  lines.push('');

  lines.push('## Context window and limits');
  lines.push('');
  lines.push(`- Context window: **${fmtTokens(ctx)} tokens**`);
  lines.push(`- Max output: **${fmtTokens(outLimit)} tokens**`);
  if (model.modalities?.input || model.modalities?.output) {
    const inMods = Array.isArray(model.modalities?.input) ? model.modalities.input.join(', ') : '';
    const outMods = Array.isArray(model.modalities?.output) ? model.modalities.output.join(', ') : '';
    lines.push(`- Modalities: input **${inMods || '—'}** → output **${outMods || '—'}**`);
  }
  lines.push('');

  lines.push('## Cost examples (so you can sanity-check fast)');
  lines.push('');
  lines.push('These are ballpark estimates using the provider’s list price. Your real bill depends on your actual token counts and whether caching applies.');
  lines.push('');
  lines.push(`- **100k input + 20k output** ≈ ${fmtMoney(ex1.total)} (input ${fmtMoney(ex1.inputCost)} + output ${fmtMoney(ex1.outputCost)})`);
  lines.push(`- **1M input + 200k output** ≈ ${fmtMoney(ex2.total)} (input ${fmtMoney(ex2.inputCost)} + output ${fmtMoney(ex2.outputCost)})`);
  lines.push('');
  lines.push(`If you want to estimate *your* workflows (summaries vs long chat vs extraction), use the calculator: [/ai-model-cost-calculator-and-price-comparation](/ai-model-cost-calculator-and-price-comparation)`);
  lines.push('');

  lines.push('## Token math (the 60-second version)');
  lines.push('');
  lines.push('Most “pricing confusion” is really “token confusion”. A simple mental model:');
  lines.push('- **Input tokens** = everything you send (your prompt + system instructions + pasted text + prior context)');
  lines.push('- **Output tokens** = what the model writes back');
  lines.push('');
  lines.push('Quick estimate formula:');
  lines.push('');
  lines.push('```text');
  lines.push('cost ≈ (inputTokens / 1,000,000) * inputPrice + (outputTokens / 1,000,000) * outputPrice');
  lines.push('```');
  lines.push('');
  lines.push('If you don’t know your token counts, start with the calculator and calibrate with 2–3 real tasks you do weekly.');
  lines.push('');

  lines.push('## When this model is worth it (and when it isn’t)');
  lines.push('');
  lines.push('High-end models are great — but only if you give them the right job. Use this model when you need:');
  lines.push('- multi-step planning / reasoning');
  lines.push('- high-stakes writing you’ll reuse');
  lines.push('- deep analysis on messy inputs');
  lines.push('');
  lines.push('Use a cheaper model when you just need:');
  lines.push('- first-pass summaries');
  lines.push('- extraction into a fixed template');
  lines.push('- quick rewrites and formatting');
  lines.push('');

  lines.push('## Cost control tips (that don’t reduce quality)');
  lines.push('');
  lines.push('- **Ask for structure** (bullets/tables) instead of long prose.');
  lines.push('- **Map first, deep dive second**: summarize into sections, then expand only 2–5 sections.');
  lines.push('- **Trim context**: don’t paste everything; paste only the relevant section + a short goal.');
  if (Number.isFinite(Number(cacheRead))) {
    lines.push('- **Use caching when available** for repeated system instructions or boilerplate inputs.');
  }
  lines.push('');

  lines.push('## How to use this model in GPT Breeze (fast setup)');
  lines.push('');
  lines.push('1) Ensure you’ve set up your provider + key (BYOK/BYOM).');
  lines.push('2) Select this model in your GPT Breeze settings (or in your shortcut’s model setting, if you use per-shortcut routing).');
  lines.push('3) Use the “cheap-first, deep-dive-second” workflow:');
  lines.push('   - Run a cheaper/faster model for the first summary pass');
  lines.push('   - Switch to a stronger model only for the 2–5 sections you’ll reuse or publish');
  lines.push('');
  lines.push('Start here if you haven’t configured the extension: [/guide/getting-started/](/guide/getting-started/)');
  lines.push('');

  lines.push('## What to do next (internal links)');
  lines.push('');
  lines.push('- Compare model costs side-by-side: [/ai-model-cost-calculator-and-price-comparation](/ai-model-cost-calculator-and-price-comparation)');
  lines.push('- Learn the core workflow (timestamps + follow-ups): [/youtube-summary](/youtube-summary)');
  lines.push('- Read about privacy boundaries: [/privacy-first](/privacy-first)');
  lines.push('- Plan selection + usage: [/pricing](/pricing)');
  lines.push('');

  lines.push('## FAQ');
  lines.push('');
  lines.push('### Is the calculator better than a static price page?');
  lines.push('Yes for *your* usage. This page is the “price sheet”; the calculator is the tool you use to estimate your real workflow cost (summaries vs long chat vs extraction).');
  lines.push('');
  lines.push('### Why do my costs feel higher than expected?');
  lines.push('Common causes: you’re sending a lot of hidden context (chat history), you’re asking for long outputs, or you’re re-sending the same instructions repeatedly instead of using caching/shortcuts.');
  lines.push('');
  lines.push('### Should I always use the newest model?');
  lines.push('Not always. New models can be great, but the best ROI often comes from routing: cheap models for first-pass work, premium models only when the output will be reused or published.');
  lines.push('');
  lines.push('### Where do these prices come from?');
  lines.push('We read pricing fields from GPT Breeze’s model catalog. Always cross-check with the provider docs for billing-critical decisions.');
  lines.push('');

  lines.push('## Data source + freshness');
  lines.push('');
  lines.push(
    `Pricing data is pulled from GPT Breeze’s internal model catalog (\`src/data/models-api.json\`) on **${dataDate}**. Providers change prices; if this page looks stale, check the calculator and the provider’s official docs.`,
  );
  lines.push('');

  return { slug, markdown: lines.join('\n') + '\n' };
}

// --- main
const args = parseArgs(process.argv);
const data = loadModelsApi();

const allowProviders = new Set([
  'openai',
  'anthropic',
  'xai',
  'groq',
  'deepseek',
  'moonshotai',
  'zai',
  'openrouter',
]);

const published = loadPublishedSet();

const candidates = pickCandidates({
  data,
  allowProviders,
  onlyProvider: args.provider,
  onlyModel: args.model,
});

// If a pricing guide already exists in the repo (even if state is missing), treat it as published.
// This prevents the publisher from getting stuck on a model whose file already exists.
for (const c of candidates) {
  const slug = `${slugify(c.modelId)}-pricing-guide`;
  const p = path.join(blogDir, `${slug}.md`);
  const key = `${c.providerKey}:${c.modelId}`;
  if (fs.existsSync(p)) published.add(key);
}

let forced = null;
if (args.provider && args.model) {
  forced = candidates.find((c) => c.providerKey === args.provider && c.modelId === args.model) ?? null;
  if (!forced) throw new Error(`No eligible model found for provider=${args.provider} model=${args.model} (missing/invalid pricing or non-text model)`);
}

const providerPriority = ['openai', 'anthropic', 'xai', 'deepseek', 'moonshotai', 'zai', 'groq', 'openrouter'];

// Keep this list intentionally small: focus on popular + new models first.
// (If a model id doesn't exist in models-api.json, it's ignored.)
const modelPriorityByProvider = {
  openai: ['gpt-5', 'gpt-5-mini', 'gpt-5-nano', 'gpt-4o', 'gpt-4o-mini', 'gpt-4.1', 'gpt-4.1-mini', 'gpt-4.1-nano'],
  anthropic: ['claude-opus-4-0', 'claude-sonnet-4-0', 'claude-3-7-sonnet-latest', 'claude-3-5-haiku-latest'],
  xai: ['grok-4', 'grok-4-fast', 'grok-3', 'grok-3-fast'],
  deepseek: ['deepseek-reasoner', 'deepseek-chat'],
  moonshotai: ['kimi-k2.5', 'kimi-k2-thinking-turbo', 'kimi-k2-turbo-preview'],
  zai: ['glm-5', 'glm-4.7', 'glm-4.5-flash'],
  groq: ['llama-3.1-8b-instant', 'llama-3.3-70b-versatile', 'deepseek-r1-distill-llama-70b'],
  openrouter: [],
};

const next = chooseNext({ candidates, published, forced, providerPriority, modelPriorityByProvider });
if (!next) {
  console.log('No eligible model pricing page to publish (all published or no models with complete pricing).');
  process.exit(0);
}

const key = `${next.providerKey}:${next.modelId}`;

const providerName = next.provider?.name || next.providerKey;
const pubDate = args.date ?? toISODate(new Date());
const dataDate = toISODate(new Date());

const rendered = renderPricingGuide({
  providerKey: next.providerKey,
  providerName,
  modelId: next.modelId,
  model: next.model,
  pubDate,
  dataDate,
});

ensureDir(blogDir);
const outPath = path.join(blogDir, `${rendered.slug}.md`);

if (fs.existsSync(outPath) && !args.update) {
  console.log(`Refusing to overwrite existing pricing guide: ${outPath} (pass --update to overwrite)`);
  process.exit(0);
}

if (args.dryRun) {
  console.log(`Dry run: would write ${outPath} for ${key}`);
  process.exit(0);
}

fs.writeFileSync(outPath, rendered.markdown, 'utf8');
if (!published.has(key)) {
  appendPublished({ key, provider: next.providerKey, model: next.modelId, slug: rendered.slug, date: pubDate, ts: new Date().toISOString() });
}

console.log(`Published model pricing guide: ${outPath}`);
