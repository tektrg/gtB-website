import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const modelsPath = path.join(root, 'src', 'data', 'models-api.json');
const guideProvidersDir = path.join(root, 'src', 'content', 'guide', 'providers');

function toISODate(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function parseArgs(argv) {
  const args = { dryRun: false, date: null, provider: null };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--dry-run') args.dryRun = true;
    else if (a === '--date') args.date = argv[++i];
    else if (a === '--provider') args.provider = argv[++i];
    else throw new Error(`Unknown arg: ${a}`);
  }
  return args;
}

function modelCount(v) {
  if (!v || !v.models) return 0;
  if (Array.isArray(v.models)) return v.models.length;
  if (typeof v.models === 'object') return Object.keys(v.models).length;
  return 0;
}

function loadModelsApi() {
  const raw = fs.readFileSync(modelsPath, 'utf8');
  return JSON.parse(raw);
}

function listPublishedProviderKeys() {
  if (!fs.existsSync(guideProvidersDir)) return new Set();
  const files = fs
    .readdirSync(guideProvidersDir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => path.basename(f, '.md'));
  return new Set(files);
}

function pickNextProviderKey(data, published, forcedKey) {
  const keys = Object.keys(data);
  if (forcedKey) {
    if (!keys.includes(forcedKey)) throw new Error(`Unknown provider key: ${forcedKey}`);
    if (published.has(forcedKey)) throw new Error(`Provider already published: ${forcedKey}`);
    return forcedKey;
  }

  const priority = [
    'openai',
    'anthropic',
    'google',
    'openrouter',
    'groq',
    'mistral',
    'togetherai',
    'azure',
    'amazon-bedrock',
    'cloudflare-workers-ai',
    'cloudflare-ai-gateway',
    'vercel',
    'helicone',
    'ollama-cloud',
    'lmstudio',
    'perplexity',
    'cohere',
    'huggingface',
  ].filter((k) => keys.includes(k));

  for (const k of priority) {
    if (!published.has(k)) return k;
  }

  // Fallback: publish remaining providers in descending model count.
  const remaining = keys
    .filter((k) => !published.has(k))
    .map((k) => ({
      key: k,
      count: modelCount(data[k]),
    }))
    .sort((a, b) => b.count - a.count);

  if (remaining.length === 0) return null;
  return remaining[0].key;
}

function escapeQuotes(s) {
  return String(s ?? '').replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function renderGuide({ providerKey, provider, pubDate }) {
  const name = provider?.name || providerKey;
  const doc = provider?.doc;
  const api = provider?.api;
  const env = provider?.env;
  const isNative = new Set(['openai', 'anthropic', 'google', 'openrouter']).has(providerKey);

  const modelIds = provider?.models && typeof provider.models === 'object' ? Object.keys(provider.models) : [];
  const examples = modelIds.slice(0, 10);

  const title = `How to set up ${name} in GPT Breeze (API key + custom model)`;
  const description = `Step-by-step: add your ${name} API credentials in GPT Breeze and create a custom model you can use for summaries, writing, and workflows.`;

  const lines = [];
  lines.push('---');
  lines.push(`title: "${escapeQuotes(title)}"`);
  lines.push(`description: "${escapeQuotes(description)}"`);
  lines.push(`pubDate: ${pubDate}`);
  lines.push(`topicId: "provider-${escapeQuotes(providerKey)}"`);
  lines.push(`tags: ["providers", "${escapeQuotes(providerKey)}", "byom", "api-keys"]`);
  lines.push('draft: false');
  lines.push('---');
  lines.push('');
  lines.push(`# ${title}`);
  lines.push('');
  lines.push(`This guide shows how to use **${name}** with **GPT Breeze** by adding a credential (API key + base URL) and then creating a custom model.`);
  lines.push('');

  lines.push('## What this provider is');
  lines.push('');
  lines.push(`${name} is one of the providers you can connect to GPT Breeze as part of a **BYOM/BYOK** workflow (Bring Your Own Model / Bring Your Own Key).`);
  if (doc) lines.push(`- Provider docs: ${doc}`);
  if (api) lines.push('- API base URL (from catalog): ' + '`' + api + '`');
  lines.push('');

  lines.push('## Step 1 — Add credentials (provider / API key)');
  lines.push('');
  lines.push('Open **GPT Breeze → Settings → Credentials (Providers)** and add a credential.');
  lines.push('');
  if (isNative) {
    lines.push(`- Provider type: **${providerKey}** (built-in)`);
    lines.push('- Base URL: leave default unless you know you need a custom endpoint');
    lines.push(`- API key: paste your **${name}** API key`);
  } else {
    lines.push('- Provider type: **Custom (OpenAI-compatible)**');
    lines.push('- Base URL: use the OpenAI-compatible endpoint provided by the vendor (see docs link above)');
    lines.push(`- API key: paste your **${name}** API key`);
  }
  lines.push('');
  if (Array.isArray(env) && env.length > 0) {
    lines.push('**Notes:** this provider typically expects environment variables like:');
    for (const k of env.slice(0, 8)) lines.push('- ' + '`' + k + '`');
    lines.push('');
  }

  lines.push('## Step 2 — Add a custom model');
  lines.push('');
  lines.push('Then go to **Custom Models → Add model** and fill:');
  lines.push('');
  lines.push('- **Model ID**: the exact model identifier the API expects');
  lines.push('- **Display name**: a human-friendly name (this is what you’ll pick in the model selector)');
  lines.push('- **Credential**: select the credential you created in Step 1');
  lines.push('');
  lines.push('If you’re on the free plan, you can create **up to 2 custom models**.');
  lines.push('');

  lines.push('## Example model IDs (from the model catalog)');
  lines.push('');
  if (examples.length === 0) {
    lines.push('This provider entry does not list model IDs in our catalog yet. Use the model name from the provider’s dashboard/docs.');
  } else {
    lines.push('Use these as **examples** (model availability can change):');
    lines.push('');
    for (const id of examples) lines.push('- ' + '`' + id + '`');
  }
  lines.push('');

  lines.push('## Troubleshooting');
  lines.push('');
  lines.push('- **401/403**: API key is missing/invalid, or your account has no access. Re-check the key and plan.');
  lines.push('- **404**: model ID is wrong, or base URL is wrong. Copy model ID exactly from the provider dashboard.');
  lines.push('- **429**: rate limit. Try a smaller model, wait, or upgrade the provider plan.');
  lines.push('');

  lines.push('## Next steps');
  lines.push('');
  lines.push('- Compare approaches: [Pricing](/pricing)');
  lines.push('- If you care about data boundaries: [Privacy-first workflow](/privacy-first)');
  lines.push('- New here: [Getting started](/guide/getting-started/)');
  lines.push('- Estimate costs: [AI model cost calculator](/ai-model-cost-calculator-and-price-comparation)');
  lines.push('');

  return lines.join('\n');
}

const args = parseArgs(process.argv);
const data = loadModelsApi();
fs.mkdirSync(guideProvidersDir, { recursive: true });

const published = listPublishedProviderKeys();
const providerKey = pickNextProviderKey(data, published, args.provider);

if (!providerKey) {
  console.log('No provider left to publish.');
  process.exit(0);
}

const now = new Date();
const pubDate = args.date ?? toISODate(now);

const outPath = path.join(guideProvidersDir, `${providerKey}.md`);
const markdown = renderGuide({ providerKey, provider: data[providerKey], pubDate });

if (args.dryRun) {
  console.log(`[dry-run] Would write: ${path.relative(root, outPath)}`);
  console.log(markdown.slice(0, 1200));
  process.exit(0);
}

fs.writeFileSync(outPath, markdown, 'utf8');
console.log(`Published provider guide: ${path.relative(root, outPath)}`);
