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
  const args = { dryRun: false, date: null, provider: null, update: false, all: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--dry-run') args.dryRun = true;
    else if (a === '--date') args.date = argv[++i];
    else if (a === '--provider') args.provider = argv[++i];
    else if (a === '--update') args.update = true;
    else if (a === '--all') args.all = true;
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

function pickNextProviderKey(data, published, forcedKey, { update = false } = {}) {
  const keys = Object.keys(data);
  if (forcedKey) {
    if (!keys.includes(forcedKey)) throw new Error(`Unknown provider key: ${forcedKey}`);
    if (published.has(forcedKey) && !update) throw new Error(`Provider already published: ${forcedKey} (pass --update to overwrite)`);
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

function normalizePubDate(dateStr) {
  // Our content collections use z.date(), so any ISO-8601 string is fine.
  // Standardize on UTC Z to match the blog posts.
  if (!dateStr) return toISODate(new Date()) + 'T00:00:00.000Z';
  if (String(dateStr).includes('T')) return dateStr;
  return `${dateStr}T00:00:00.000Z`;
}

function whenToUse(providerKey, name) {
  const map = {
    openai: [
      'You want the widest compatibility and a “default” provider that just works.',
      'You’re optimizing for strong general performance across summaries + writing.',
    ],
    anthropic: [
      'You care about careful writing and high-quality summarization for longer prompts.',
      'You want a provider you can trust for “thinky” drafts and rewrites.',
    ],
    google: [
      'You want Gemini models and strong multimodal + long-context workflows.',
      'You want a built-in setup that’s easy to maintain.',
    ],
    openrouter: [
      'You want one endpoint to try lots of models (switch often, keep setup simple).',
      'You want to compare models without setting up 5 different providers.',
    ],
    groq: [
      'You want speed/low latency for high-volume summarization.',
      'You want a fast OpenAI-compatible endpoint for popular open models.',
    ],
    mistral: [
      'You want a clean provider option for everyday work (summaries + drafts).',
      'You prefer Mistral-hosted models for vendor/region reasons.',
    ],
    togetherai: [
      'You want a large catalog of open models under one provider.',
      'You want cheaper/faster models for everyday workflows.',
    ],
    azure: [
      'You need Azure governance/billing and your org standardized on Azure.',
      'You already have Azure OpenAI deployments and want to use them in GPT Breeze.',
    ],
    'amazon-bedrock': [
      'You’re already deep in AWS and want AWS governance/billing for models.',
      'You want Bedrock-only availability or regional model access.',
    ],
    'cloudflare-workers-ai': [
      'You already use Cloudflare and want to call models from the Cloudflare platform.',
      'You want a catalog of smaller models you can run with a simple key + account.',
    ],
  };

  return (
    map[providerKey] ?? [
      `You already use ${name} and want to keep your GPT Breeze setup consistent.`,
      'You want more control over cost and model choice via BYOM/BYOK.',
    ]
  );
}

function providerBaseUrl(providerKey, provider) {
  // models-api.json contains `api` for some providers (OpenRouter/Cloudflare Workers AI).
  // For other OpenAI-compatible providers, we maintain a small hardcoded map.
  if (provider?.api) return provider.api;

  const map = {
    groq: 'https://api.groq.com/openai/v1',
    mistral: 'https://api.mistral.ai/v1',
    togetherai: 'https://api.together.xyz/v1',
  };

  return map[providerKey] ?? null;
}

function recommendedStarterModel(providerKey, examples) {
  const pref = {
    openai: 'gpt-4o-mini',
    anthropic: 'claude-3-5-haiku-latest',
    google: 'gemini-2.5-flash',
    openrouter: 'nvidia/nemotron-nano-9b-v2:free',
    groq: 'llama-3.1-8b-instant',
    mistral: 'mistral-small-2506',
    togetherai: 'meta-llama/Llama-3.1-8B-Instruct-Turbo',
    'cloudflare-workers-ai': '@cf/mistral/mistral-7b-instruct-v0.1',
  };

  const wanted = pref[providerKey];
  if (wanted && examples.includes(wanted)) return wanted;
  if (wanted) return wanted;
  return examples[0] ?? null;
}

function renderGuide({ providerKey, provider, pubDate, updatedDate }) {
  const name = provider?.name || providerKey;
  const doc = provider?.doc;
  const env = provider?.env;

  const isNative = new Set(['openai', 'anthropic', 'google', 'openrouter']).has(providerKey);
  const isAzure = providerKey === 'azure';
  const isBedrock = providerKey === 'amazon-bedrock';

  const api = providerBaseUrl(providerKey, provider);

  const modelIds = provider?.models && typeof provider.models === 'object' ? Object.keys(provider.models) : [];
  const examples = modelIds.slice(0, 10);

  const title = isAzure
    ? `How to set up Azure OpenAI in GPT Breeze (endpoint + deployment)`
    : `How to set up ${name} in GPT Breeze (API key + custom model)`;

  const description = isAzure
    ? `Step-by-step: connect Azure OpenAI to GPT Breeze using a Custom (OpenAI-compatible) credential, including endpoint format and deployment/model mapping.`
    : `A practical setup guide to connect ${name} to GPT Breeze: add credentials, create a custom model, and avoid the common BYOK mistakes.`;

  const normalizedPubDate = normalizePubDate(pubDate);

  const starter = recommendedStarterModel(providerKey, examples);

  const lines = [];
  lines.push('---');
  lines.push(`title: "${escapeQuotes(title)}"`);
  lines.push(`description: "${escapeQuotes(description)}"`);
  lines.push(`pubDate: ${normalizedPubDate}`);
  if (updatedDate) lines.push(`updatedDate: ${updatedDate}`);
  lines.push(`topicId: "provider-${escapeQuotes(providerKey)}"`);
  lines.push(`tags: ["providers", "${escapeQuotes(providerKey)}", "byom", "api-keys"]`);
  lines.push('draft: false');
  lines.push('---');
  lines.push('');

  // Hook (blog-like)
  if (isAzure) {
    lines.push(`# ${title}`);
    lines.push('');
    lines.push(
      `Azure OpenAI setup trips people up because the “model” you call is usually your **deployment name**, not the vendor model id. This page gives you the fast path (and the failure modes) so you don’t burn an hour on 404s.`,
    );
  } else {
    lines.push(`# ${title}`);
    lines.push('');
    lines.push(
      `Connecting **${name}** to GPT Breeze is simple in theory: paste a key, pick a model, done. In practice, most failures come from one of three things: the wrong base URL, the wrong model id, or a key that doesn’t have access. This guide is the “do this, not that” version.`,
    );
  }
  lines.push('');

  // Pain points (blog pattern)
  lines.push('## What people actually struggle with');
  lines.push('');
  const pains = [];
  pains.push('“I pasted my key but it still says 401/403.”');
  pains.push('“I get 404 — I’m sure the model exists.”');
  if (!isNative) pains.push('“I don’t know what base URL to use.”');
  if (isAzure) pains.push('“Azure wants a deployment name — where do I put that?”');
  if (isBedrock) pains.push('“Bedrock isn’t just an API key — why is everything failing?”');
  for (const p of pains) lines.push(`- ${p}`);
  lines.push('');

  // TL;DR (operational)
  lines.push('## TL;DR (2-minute setup)');
  lines.push('');
  lines.push('1) Create an API key (treat it like a password).');
  lines.push('');
  lines.push('2) In **GPT Breeze → Settings → Credentials (Providers)**, add a credential.');
  lines.push('');
  if (isBedrock) {
    lines.push('   - Bedrock usually needs AWS SigV4 signing. The practical setup is to use an OpenAI-compatible **gateway/proxy** that handles signing, then point GPT Breeze to that gateway.');
  } else if (isNative) {
    lines.push('   - **Provider type:** `' + providerKey + '` (built-in)');
    lines.push('   - **Base URL:** leave default');
    lines.push(`   - **API key:** your ${name} key`);
  } else if (isAzure) {
    lines.push('   - **Provider type:** Custom (OpenAI-compatible)');
    lines.push('   - **Base URL:** `https://YOUR_RESOURCE_NAME.openai.azure.com/openai/deployments`');
    lines.push('   - **API key:** your Azure API key');
  } else {
    lines.push('   - **Provider type:** Custom (OpenAI-compatible)');
    lines.push(`   - **Base URL:** ${api ? '`' + api + '`' : '(see provider docs)'}`);
    lines.push(`   - **API key:** your ${name} key`);
  }
  lines.push('');
  lines.push('3) In **Custom Models → Add model**, add a model you can actually pick in the UI.');
  if (isAzure) {
    lines.push('   - **Model ID:** your Azure **deployment name**');
  } else {
    lines.push('   - **Model ID:** a valid model id (examples below)');
  }
  lines.push('');
  lines.push('Provider/model selector demo: https://youtu.be/QS7TU0xuvDk');
  lines.push('');

  // What it is / sources
  lines.push('## What this provider is');
  lines.push('');
  if (isAzure) {
    lines.push('Azure OpenAI is OpenAI-family models served through Azure infrastructure and Azure billing/governance.');
  } else if (isBedrock) {
    lines.push('Amazon Bedrock is AWS’s managed model platform (Anthropic, Meta, Amazon Titan, Cohere, etc.).');
  } else {
    lines.push(`${name} is a provider you can connect to GPT Breeze as part of a BYOK/BYOM workflow.`);
  }
  lines.push('');
  if (doc) lines.push(`- Provider docs: ${doc}`);
  if (Array.isArray(env) && env.length > 0) {
    lines.push('- Common env vars (from our catalog): ' + env.map((e) => '`' + e + '`').slice(0, 6).join(', '));
  }
  lines.push('');

  lines.push('## When to use it');
  lines.push('');
  for (const b of whenToUse(providerKey, name)) lines.push(`- ${b}`);
  lines.push('');

  // Do it in GPT Breeze (blog’s “concrete usage” requirement)
  lines.push('## Do it in GPT Breeze (30 seconds)');
  lines.push('');
  lines.push('1) Add the credential (provider + key).');
  lines.push('2) Add a custom model (so it appears in the model picker).');
  lines.push('3) Use it in a shortcut (YouTube toolbar / page toolbar / text selection toolbar).');
  lines.push('');

  // Operational details
  lines.push('## Credentials: what to enter');
  lines.push('');
  lines.push('Open **Settings → Credentials (Providers)** and fill:');
  lines.push('');
  if (isBedrock) {
    lines.push('- **Recommended:** use a gateway/proxy and put the gateway URL in **Base URL**.');
    lines.push('- Bedrock auth is not “paste a key”; it’s usually AWS credentials + SigV4 signing.');
  } else if (isNative) {
    lines.push(`- **Provider type:** ${providerKey} (built-in)`);
    lines.push('- **Base URL:** default');
    lines.push(`- **API key:** your ${name} key`);
  } else if (isAzure) {
    lines.push('- **Provider type:** Custom (OpenAI-compatible)');
    lines.push('- **Base URL:** `https://YOUR_RESOURCE_NAME.openai.azure.com/openai/deployments`');
    lines.push('- **API key:** your Azure key');
  } else {
    lines.push('- **Provider type:** Custom (OpenAI-compatible)');
    lines.push(`- **Base URL:** ${api ? '`' + api + '`' : 'from the provider docs'}`);
    lines.push(`- **API key:** your ${name} key`);
  }
  lines.push('');

  lines.push('## Custom model: what to enter');
  lines.push('');
  lines.push('Open **Custom Models → Add model**:');
  lines.push('');
  if (isAzure) {
    lines.push('- **Model ID:** your Azure **deployment name**');
    lines.push('- **Why:** Azure routes requests by deployment, not by raw vendor model id.');
  } else {
    lines.push('- **Model ID:** exact model id the API expects');
  }
  lines.push('- **Display name:** whatever you want to see in the picker');
  lines.push('- **Credential:** select the credential you created');
  lines.push('');

  // Examples + starter model
  lines.push('## Example model IDs');
  lines.push('');
  if (examples.length === 0) {
    lines.push('Use model IDs from the provider dashboard/docs (our catalog does not list examples here yet).');
  } else {
    lines.push('Use these as examples (availability changes):');
    lines.push('');
    for (const id of examples) lines.push('- ' + '`' + id + '`');
  }
  lines.push('');

  if (starter) {
    lines.push('## Recommended starter model');
    lines.push('');
    lines.push('If you just want to validate your setup quickly, start with: `' + starter + '`');
    lines.push('');
  }

  // Prompts (blog-like: give runnable templates)
  lines.push('## Prompt templates (copy/paste)');
  lines.push('');
  lines.push('```text');
  lines.push('Summarize this into:');
  lines.push('- TL;DR (5 bullets)');
  lines.push('- Key takeaways');
  lines.push('- Action items');
  lines.push('- Questions to verify');
  lines.push('Keep it skimmable.');
  lines.push('```');
  lines.push('');
  lines.push('```text');
  lines.push('Rewrite this for clarity.');
  lines.push('Constraints:');
  lines.push('- keep facts the same');
  lines.push('- remove fluff');
  lines.push('- output as a numbered checklist');
  lines.push('```');
  lines.push('');

  // Troubleshooting (operational)
  lines.push('## Common errors (and the real fix)');
  lines.push('');
  lines.push('- **401/403**: key invalid/missing, or your account/project doesn’t have access. Create a new key and ensure billing/access is enabled.');
  if (isAzure) lines.push('- **404**: usually wrong deployment name or base URL missing `/openai/deployments`.');
  else lines.push('- **404**: model ID is wrong, or base URL is wrong. Copy the model ID exactly.');
  lines.push('- **429**: rate limit — retry later, or use a smaller model.');
  if (isBedrock) lines.push('- **Signature / AccessDenied**: you are hitting Bedrock without SigV4 signing or without Bedrock permissions.');
  lines.push('');

  // Internal links like blog posts
  lines.push('## Next steps');
  lines.push('');
  lines.push('- Browse all providers: [/guide/providers/](/guide/providers/)');
  lines.push('- New here: [Getting started](/guide/getting-started/)');
  lines.push('- Compare approaches: [Pricing](/pricing)');
  lines.push('- If you care about data boundaries: [Privacy-first workflow](/privacy-first)');
  lines.push('- Estimate costs: [AI model cost calculator](/ai-model-cost-calculator-and-price-comparation)');
  lines.push('');

  // Sources section
  lines.push('## Sources');
  lines.push('');
  if (doc) lines.push(`- ${doc}`);
  else lines.push(`- Provider docs (see ${name} website/dashboard)`);
  lines.push('');

  return lines.join('\n');
}

const args = parseArgs(process.argv);
const data = loadModelsApi();
fs.mkdirSync(guideProvidersDir, { recursive: true });

const published = listPublishedProviderKeys();

function readExistingPubDate(providerKey) {
  const p = path.join(guideProvidersDir, `${providerKey}.md`);
  if (!fs.existsSync(p)) return null;
  const raw = fs.readFileSync(p, 'utf8');
  const m = raw.match(/\n?---\n([\s\S]*?)\n---\n/);
  if (!m) return null;
  const fm = m[1];
  const pub = fm.match(/^pubDate:\s*(.+)\s*$/m);
  return pub ? String(pub[1]).trim() : null;
}

function dateOnly(d) {
  if (!d) return toISODate(new Date());
  return String(d).slice(0, 10);
}

const keysToWrite = (() => {
  if (args.all) {
    const existing = Array.from(published);
    return existing.length > 0 ? existing : Object.keys(data);
  }

  const k = pickNextProviderKey(data, published, args.provider, { update: args.update });
  return k ? [k] : [];
})();

if (keysToWrite.length === 0) {
  console.log('[skip] No providers selected.');
  process.exit(0);
}

for (const providerKey of keysToWrite) {
  const outPath = path.join(guideProvidersDir, `${providerKey}.md`);

  const existingPubDate = readExistingPubDate(providerKey);
  const pubDate = existingPubDate || args.date || toISODate(new Date());
  const updatedDate = dateOnly(args.date || toISODate(new Date()));

  const markdown = renderGuide({
    providerKey,
    provider: data[providerKey],
    pubDate,
    updatedDate,
  });

  if (args.dryRun) {
    console.log(`[dry-run] Would write: ${path.relative(root, outPath)}`);
    console.log(markdown.slice(0, 1200));
    continue;
  }

  fs.writeFileSync(outPath, markdown, 'utf8');
  console.log(`[ok] Wrote provider guide: ${path.relative(root, outPath)}`);
}
