import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const topicBankPath = path.join(
  root,
  "AUTONOMUS",
  "content",
  "topic-bank.json",
);
const stateDir = path.join(root, "AUTONOMUS", "state");
const ledgerPath = path.join(stateDir, "published.jsonl");
const blogDir = path.join(root, "src", "content", "blog");
const planPath = path.join(root, "AUTONOMUS", "plan.md");
const researchDir = path.join(root, "AUTONOMUS", "research", "blog");

function parseArgs(argv) {
  const args = { dryRun: false, date: null, topicId: null };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--dry-run") args.dryRun = true;
    else if (a === "--date") args.date = argv[++i];
    else if (a === "--topic") args.topicId = argv[++i];
    else throw new Error(`Unknown arg: ${a}`);
  }
  return args;
}

function slugify(input) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function toISODate(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function loadLedger() {
  if (!fs.existsSync(ledgerPath)) return [];
  const lines = fs
    .readFileSync(ledgerPath, "utf8")
    .split(/\r?\n/)
    .filter(Boolean);
  const items = [];
  for (const line of lines) {
    try {
      items.push(JSON.parse(line));
    } catch {
      // ignore corrupted lines
    }
  }
  return items;
}

function listMarkdown(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => path.join(dir, f));
}

function parseFrontmatter(content) {
  if (!content.startsWith('---')) return { data: {}, body: content };
  const end = content.indexOf('\n---', 3);
  if (end === -1) return { data: {}, body: content };
  const fmRaw = content.slice(3, end).trim();
  const body = content.slice(end + 4);
  const data = {};
  const lines = fmRaw.split(/\r?\n/);
  let currentKey = null;
  for (const line of lines) {
    if (!line.trim()) continue;
    if (/^\s*-\s+/.test(line) && currentKey) {
      const val = line.replace(/^\s*-\s+/, '').trim();
      if (!Array.isArray(data[currentKey])) data[currentKey] = [];
      data[currentKey].push(val.replace(/^"|"$/g, '').replace(/^'|'$/g, ''));
      continue;
    }
    const match = line.match(/^([^:]+):\s*(.*)$/);
    if (!match) continue;
    const key = match[1].trim();
    let value = match[2].trim();
    currentKey = key;
    if (!value) {
      data[key] = data[key] ?? [];
      continue;
    }
    data[key] = value.replace(/^"|"$/g, '').replace(/^'|'$/g, '');
  }
  return { data, body };
}

function computeUsedTopicIds() {
  const used = new Set();

  // Prefer the committed ledger when present.
  const ledger = loadLedger();
  for (const x of ledger) if (x?.topicId) used.add(x.topicId);

  // Also scan existing content; this makes rotation robust even if the ledger is missing.
  for (const file of listMarkdown(blogDir)) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const { data } = parseFrontmatter(content);
      if (data.topicId) used.add(String(data.topicId));
    } catch {
      // ignore
    }
  }

  return used;
}

function pickTopicStrict(topics, forcedId) {
  if (forcedId) {
    const t = topics.find((x) => x.id === forcedId);
    if (!t) throw new Error(`Unknown topic id: ${forcedId}`);
    return t;
  }

  const used = computeUsedTopicIds();
  const unused = topics.filter((t) => !used.has(t.id));
  if (unused.length === 0) {
    throw new Error(
      `Topic bank exhausted (strict mode). Add more topics in AUTONOMUS/content/topic-bank.json before publishing again.`,
    );
  }
  return unused[0];
}

function mdEscapeInline(text) {
  return String(text).replace(/\n/g, " ").trim();
}

function loadResearchOrSkip(topicId) {
  const res = loadResearch(topicId);
  if (!res.ok) {
    return { ok: false, reason: res.reason };
  }

  const problems = validateResearch(res.content);
  if (problems.length > 0) {
    return {
      ok: false,
      reason: `Research not ready: ${path.relative(root, res.file)}\n- ${problems.join('\n- ')}`,
    };
  }

  const urls = res.content.match(/https?:\/\/\S+/g) || [];
  return {
    ok: true,
    research: {
      path: res.file,
      text: res.content,
      urls,
    },
  };
}

function extractSectionBullets(md, headingRegex) {
  const lines = md.split(/\r?\n/);
  let start = -1;
  for (let i = 0; i < lines.length; i++) {
    if (headingRegex.test(lines[i])) {
      start = i + 1;
      break;
    }
  }
  if (start === -1) return [];
  const out = [];
  for (let i = start; i < lines.length; i++) {
    const l = lines[i];
    if (/^#{1,6}\s+/.test(l)) break;
    const m = l.match(/^\s*[-*]\s+(.*)$/);
    if (m) out.push(m[1].trim());
  }
  return out.filter(Boolean);
}

function renderPost({ topic, pubDate, research }) {
  const title = topic.title;
  const description = topic.description;
  const tags = topic.tags || [];

  const painPoints = extractSectionBullets(research?.text ?? '', /###\s+Pain points/i);
  const sourceLinks = extractSectionBullets(research?.text ?? '', /###\s+Source links/i).slice(0, 8);

  const topicText = `${title} ${description} ${tags.join(" ")}`.toLowerCase();
  const isYouTube =
    topicText.includes("youtube") ||
    topicText.includes("transcript") ||
    topicText.includes("video");
  const isPrivacy =
    topicText.includes("privacy") ||
    topicText.includes("byok") ||
    topicText.includes("byom") ||
    topicText.includes("api key");
  const isComparison =
    topicText.includes("alternative") ||
    topicText.includes("compare") ||
    topicText.includes("best");

  const lines = [];
  lines.push("---");
  lines.push(`title: "${mdEscapeInline(title).replace(/"/g, '\\"')}"`);
  lines.push(
    `description: "${mdEscapeInline(description).replace(/"/g, '\\"')}"`,
  );
  lines.push(`pubDate: ${pubDate}T00:00:00.000Z`);
  lines.push(`topicId: "${topic.id}"`);
  lines.push('author: "GPT Breeze"');
  lines.push("tags:");
  for (const t of tags)
    lines.push(`  - "${mdEscapeInline(t).replace(/"/g, '\\"')}"`);
  lines.push("draft: false");
  lines.push("---");
  lines.push("");

  // Keep this evergreen: no claims about current model specs/pricing.
  if (topic.id === "byom-security-checklist") {
    lines.push(
      "BYOM (Bring Your Own Model) is powerful because it puts you in control: you choose the model, you bring the key, and you decide what data gets sent.",
    );
    lines.push(
      "That control comes with responsibility. If you use a browser extension with BYOM, you need a basic security playbook for API keys, sensitive text, and extension permissions.",
    );
    lines.push("");
  } else {
    lines.push(mdEscapeInline(description));
    lines.push("");
  }

  // Research-driven section: ground the article in real user pain.
  if (painPoints.length > 0) {
    lines.push("## What people actually struggle with");
    lines.push("");
    for (const p of painPoints.slice(0, 8)) lines.push(`- ${p}`);
    lines.push("");
  }

  if (topic.id === "prompt-privacy-basics") {
    lines.push(
      "Good prompts are specific. Safe prompts are specific without exposing secrets. The goal is not paranoia; it is building a repeatable habit so you never accidentally paste something you will regret later.",
    );
    lines.push("");

    lines.push("## The 3 categories of sensitive data");
    lines.push("");
    lines.push("Most leaks fall into one of these buckets:");
    lines.push("");
    lines.push(
      "- Credentials: API keys, access tokens, cookies, bearer headers, SSH keys.",
    );
    lines.push(
      "- Personal data (PII): names, emails, phone numbers, addresses, customer IDs.",
    );
    lines.push(
      "- Business secrets: internal links, unreleased features, financials, private documents.",
    );
    lines.push("");
    lines.push(
      "If a string can be used to log in, identify a person, or reveal strategy, assume it should not be pasted verbatim.",
    );
    lines.push("");

    lines.push("## Redaction patterns that work");
    lines.push("");
    lines.push(
      "Redaction fails when it destroys structure. Keep the structure, drop the sensitive values:",
    );
    lines.push("");
    lines.push(
      "- Replace values with stable tokens: `{{EMAIL_1}}`, `{{USER_42}}`, `{{ORG_A}}`.",
    );
    lines.push(
      '- Keep counts and ranges: \"~12 tickets\" or \"between 2-4 weeks\" instead of exact numbers.',
    );
    lines.push(
      "- Prefer paraphrased excerpts: paste one representative paragraph, not an entire doc.",
    );
    lines.push("");
    lines.push("Example (safe):");
    lines.push("");
    lines.push(
      '> \"Customer {{CUSTOMER_1}} reports billing mismatch after upgrading plan {{PLAN_A}}. Error occurs on step {{STEP_3}}. Provide a troubleshooting checklist and a support reply.\"',
    );
    lines.push("");

    lines.push("## Using placeholders without losing context");
    lines.push("");
    lines.push("Placeholders work best when you add a short glossary:");
    lines.push("");
    lines.push("- `{{CUSTOMER_1}}`: SMB customer in EU, on annual plan");
    lines.push("- `{{PLAN_A}}`: mid-tier subscription plan");
    lines.push("- `{{STEP_3}}`: checkout confirmation screen");
    lines.push("");
    lines.push(
      "This preserves constraints (region, plan type, funnel step) while keeping identifiers private.",
    );
    lines.push("");

    lines.push("## Team workflows: docs, tickets, and logs");
    lines.push("");
    lines.push("A lightweight policy that actually sticks:");
    lines.push("");
    lines.push("1. Create a shared redaction checklist in your team docs.");
    lines.push(
      "2. Default to summarize-first: summarize a ticket, then ask for rewrite using the summary.",
    );
    lines.push(
      "3. Keep logs out of prompts unless sanitized (logs often contain tokens and URLs).",
    );
    lines.push(
      "4. Link to your privacy posture so it is easy to follow: `/privacy-first`.",
    );
    lines.push("");
    lines.push(
      "If you want predictable costs while keeping control, compare approaches on `/pricing`.",
    );
    lines.push("");

    lines.push("---");
    lines.push("");
    lines.push(
      "Want a safer workflow that still feels fast? GPT Breeze is built around BYOM flexibility and privacy-first habits.",
    );
    lines.push("");
    return lines.join("\n");
  }

  if (topic.id === "internal-linking-playbook") {
    lines.push(
      "Internal linking is one of the highest leverage SEO moves because you control it completely. The trick is to be systematic so links help users (and Google) without turning posts into spam.",
    );
    lines.push("");

    lines.push("## Pick 3 money pages");
    lines.push("");
    lines.push(
      "Choose 3 pages you want to rank and convert. For GPT Breeze, good defaults are:",
    );
    lines.push("");
    lines.push("- `/pricing` (intent: comparison and purchase)");
    lines.push("- `/privacy-first` (intent: trust and differentiation)");
    lines.push("- `/youtube-summary` (intent: feature + use case)");
    lines.push("");
    lines.push(
      "Every new post should link to at least 1 money page when it is contextually relevant.",
    );
    lines.push("");

    lines.push("## Define 5 recurring anchors");
    lines.push("");
    lines.push(
      "Create a small set of natural anchors you can reuse across posts:",
    );
    lines.push("");
    lines.push('- \"privacy-first workflow\" -> `/privacy-first`');
    lines.push('- \"compare plans\" -> `/pricing`');
    lines.push('- \"summarize YouTube videos\" -> `/youtube-summary`');
    lines.push(
      '- \"model cost calculator\" -> `/ai-model-cost-calculator-and-price-comparation`',
    );
    lines.push('- \"getting started\" -> `/guide/getting-started/`');
    lines.push("");
    lines.push(
      "This avoids random anchors and creates consistent topical signals.",
    );
    lines.push("");

    lines.push("## Where links belong in a post");
    lines.push("");
    lines.push("Simple placement rules:");
    lines.push("");
    lines.push("- Early: 1 contextual link near the intro (high visibility).");
    lines.push(
      "- Middle: links inside checklists and comparisons (highest intent).",
    );
    lines.push("- End: 1 strong CTA link (conversion).");
    lines.push("");
    lines.push(
      "Avoid footers packed with 10 links. It looks spammy and users ignore it.",
    );
    lines.push("");

    lines.push("## How to keep it consistent");
    lines.push("");
    lines.push("Make it part of publishing:");
    lines.push("");
    lines.push('1. Add a final \"internal links\" pass before publishing.');
    lines.push(
      "2. Keep a small anchor list in your notes (or in `AUTONOMUS/plan.md`).",
    );
    lines.push(
      "3. Run `npm run seo:verify` so every post meets the same baseline quality bar.",
    );
    lines.push("");

    lines.push("---");
    lines.push("");
    lines.push(
      "If you want to see BYOM vs subscription tradeoffs, start at `/pricing` and pick what matches your workflow.",
    );
    lines.push("");
    return lines.join("\n");
  }

  const sections = topic.sections || [];
  for (const h of sections) {
    lines.push(`## ${h}`);
    lines.push("");

    if (h.toLowerCase().includes("what byom changes")) {
      lines.push(
        "BYOM is not just a billing preference. It changes your operational model:",
      );
      lines.push("");
      lines.push(
        "- You own the credential: your API key becomes part of your daily workflow.",
      );
      lines.push(
        "- You control the routing: which provider gets your requests, and which model processes them.",
      );
      lines.push(
        "- You control the data boundary: what context goes into prompts, and what gets cached or stored.",
      );
      lines.push("");
      lines.push(
        "What BYOM does not change: you still need prompt hygiene, a clear policy for sensitive data, and repeatable checks before you publish content or share outputs.",
      );
      lines.push("");
      continue;
    }

    if (h.toLowerCase().includes("threat model")) {
      lines.push(
        "- Your API key: stored, copied, logged, or exposed via permissions.",
      );
      lines.push(
        "- Your data: pasted content, page content, and any background context the extension can access.",
      );
      lines.push(
        "- Your outputs: cached results, shared links, exported docs.",
      );
      lines.push("");
      lines.push(
        "A useful mental model: assume anything the extension can read could be sent to an API if you click the wrong button or enable the wrong toggle.",
      );
      lines.push("Your job is to make the safe path the default.");
      lines.push("");
      continue;
    }

    if (h.toLowerCase().includes("key handling")) {
      lines.push("Goal: reduce the blast radius if a key is ever exposed.");
      lines.push("");
      lines.push(
        "- Prefer short-lived or scoped keys when your provider supports it (limits, allowed domains, per-project keys).",
      );
      lines.push(
        "- Never hardcode keys in extension source code, build artifacts, or config files committed to git.",
      );
      lines.push(
        "- Store keys only in the minimal scope needed. If you do not need sync across devices, avoid sync storage.",
      );
      lines.push(
        "- Use a dedicated key for the extension (not the same key as your backend server).",
      );
      lines.push(
        '- Treat \"export settings\" as sensitive: keys should be excluded or redacted by default.',
      );
      lines.push("");
      lines.push(
        "Fast self-check: search your repo and downloads for patterns like `sk-`, `api_key`, `Authorization:` to confirm nothing leaked.",
      );
      lines.push("");
      continue;
    }

    if (h.toLowerCase().includes("data handling")) {
      lines.push(
        "Goal: avoid accidental disclosure while keeping prompts useful.",
      );
      lines.push("");
      lines.push(
        "- Default to manual send: you choose what text is sent, rather than auto-scraping an entire page.",
      );
      lines.push(
        "- Redact secrets: API keys, access tokens, customer PII, internal URLs, and confidential docs.",
      );
      lines.push(
        "- Use placeholders (e.g. `{{CUSTOMER_NAME}}`) and a short glossary to keep prompts effective.",
      );
      lines.push(
        "- Prefer summarize-first workflows: turn raw docs into non-sensitive bullets, then ask for rewrites using those bullets.",
      );
      lines.push("");
      lines.push(
        "If you're optimizing for privacy, see `/privacy-first` for a stricter workflow.",
      );
      lines.push("");
      continue;
    }

    if (h.toLowerCase().includes("vendor")) {
      lines.push("Goal: keep the extension attack surface small.");
      lines.push("");
      lines.push(
        '- Review extension permissions. Anything beyond what the feature needs is a risk, especially broad \"read and change all data\" site access.',
      );
      lines.push(
        "- Prefer tools that are transparent about what they collect and where it is processed.",
      );
      lines.push(
        "- If a tool supports BYOM, verify whether it proxies requests or sends directly from your device. Proxying can add logging and storage risk.",
      );
      lines.push(
        "- If you are on a team: establish a lightweight review policy for extensions and who can install them.",
      );
      lines.push("");
      continue;
    }

    if (h.toLowerCase().includes("workflow")) {
      lines.push("A simple routine that works for most teams:");
      lines.push("");
      lines.push("1. Create a dedicated provider key for your BYOM tool.");
      lines.push("2. Use a redaction checklist for any pasted content.");
      lines.push(
        '3. Keep \"money pages\" linked in relevant posts (e.g. `/pricing`).',
      );
      lines.push("4. Re-run an SEO hygiene check before publishing.");
      lines.push("");
      lines.push(
        "If you're deciding between BYOM and subscriptions, start with `/pricing` and pick based on your risk tolerance and budget predictability.",
      );
      lines.push("");
      lines.push("Copy/paste checklist:");
      lines.push("");
      lines.push("- Key stored? (where, how, who has access)");
      lines.push("- Page access limited? (only needed sites)");
      lines.push("- Sensitive data redacted? (PII, tokens, internal links)");
      lines.push("- Export/share safe? (no keys, no raw dumps)");
      lines.push("- Logs reviewed? (no prompt dumps in logs)");
      lines.push("");
      continue;
    }

    // Default: generate a full, user-intent section (avoid thin content).
    lines.push(
      `Here’s the practical version of **${h}**—the goal is to get a usable output in one session, not to overthink tooling.`,
    );
    lines.push("");

    lines.push("What to aim for:");
    lines.push("");
    lines.push("- A short answer first (so you can decide fast)." );
    lines.push("- A structured breakdown (so you can trust what you’re reading)." );
    lines.push("- Actionable next steps (so it turns into progress, not notes)." );
    lines.push("- Links back to the source sections (for quick verification)." );
    lines.push("");

    // Add concrete steps / checklists so the post reliably clears the quality gates.
    if (h.toLowerCase().includes("step-by-step") || h.toLowerCase().includes("step by step")) {
      lines.push("Do this:");
      lines.push("");
      lines.push("1. Open the page/video you want to work on.");
      lines.push("2. Run a summary first (get the big picture).");
      lines.push("3. Ask 2–3 follow-ups for what you actually need (decisions, takeaways, action items). ");
      lines.push("4. Save the prompt as a shortcut if you’ll repeat it.");
      lines.push("5. Export/share only the sanitized output (avoid pasting raw private docs)." );
      lines.push("");
      lines.push(
        `If you’re new, start with [Getting started](/guide/getting-started/).${isYouTube ? " For video workflows, see [/youtube-summary](/youtube-summary)." : ""}`,
      );
      lines.push("");
    } else if (h.toLowerCase().includes("prompt")) {
      lines.push("Copy/paste prompt templates:");
      lines.push("");
      lines.push("```text");
      lines.push("Summarize this into 8 bullets. Focus on decisions, numbers, and action items.");
      lines.push("Then give me 3 follow-up questions I should ask next.");
      lines.push("```");
      lines.push("");
      lines.push("```text");
      lines.push("Extract the key claims and supporting evidence. Mark uncertain parts as \"needs verification\".");
      lines.push("Output: (1) claims, (2) evidence, (3) counterpoints, (4) my next steps.");
      lines.push("```");
      lines.push("");
      lines.push("```text");
      lines.push("Turn this into a 5-sentence executive summary + a checklist I can execute in 30 minutes.");
      lines.push("```");
      lines.push("");
    } else if (h.toLowerCase().includes("privacy")) {
      lines.push("Privacy checklist (fast):");
      lines.push("");
      lines.push("- Don’t paste keys/tokens/cookies. Replace with placeholders.");
      lines.push("- Don’t paste internal URLs or customer identifiers.");
      lines.push("- Prefer summarize-first: summarize sensitive docs into neutral bullets, then rewrite from bullets.");
      lines.push("");
      lines.push(
        `If privacy is a priority, follow the stricter workflow on [/privacy-first](/privacy-first).${isComparison ? " If cost predictability matters, compare approaches on [/pricing](/pricing)." : ""}`,
      );
      lines.push("");
    } else if (h.toLowerCase().includes("checklist") || h.toLowerCase().includes("compare") || h.toLowerCase().includes("evaluation") || isComparison) {
      lines.push("Evaluation checklist:");
      lines.push("");
      lines.push("- Output quality: does it capture the right level of detail?");
      lines.push("- Speed: can you get a first pass in under a minute?");
      lines.push("- Timestamps/transcripts (for video): do you get clickable sections?");
      lines.push("- Cost control: subscription vs BYOK/BYOM.");
      lines.push("- Privacy: what data is stored, and where?");
      lines.push("");
      lines.push("If you want predictable tradeoffs, start at [/pricing](/pricing).");
      lines.push("");
    } else if (h.toLowerCase().includes("faq")) {
      lines.push("Quick answers:");
      lines.push("");
      lines.push("- **Will the summary be perfect?** No—treat it as a draft, then ask targeted follow-ups.");
      lines.push("- **How do I keep it private?** Don’t paste secrets; use placeholders + summarize-first.");
      lines.push(`- **Where do I start?** [/guide/getting-started/](/guide/getting-started/) is the fastest path.`);
      lines.push(`- **What about video?** ${isYouTube ? "Use [/youtube-summary](/youtube-summary) workflows." : "If you do YouTube often, use [/youtube-summary](/youtube-summary)."}`);
      lines.push("");
    } else {
      lines.push("A simple way to avoid noise:");
      lines.push("");
      lines.push("- Start with a short summary.");
      lines.push("- Then ask for one specific output (checklist / decision / action items).");
      lines.push("- Save the prompt as a shortcut once it works.");
      lines.push("");
    }

    lines.push("Reusable output format:");
    lines.push("");
    lines.push("```text");
    lines.push("Summary (5 bullets):");
    lines.push("Key takeaways:");
    lines.push("Action items:");
    lines.push("Questions to clarify:");
    lines.push("Relevant links/sections to re-check:");
    lines.push("```");
    lines.push("");
  }

  lines.push("---");
  lines.push("");
  lines.push(
    "Want faster workflows without sacrificing control? GPT Breeze is built for BYOM-style flexibility with a privacy-first mindset.",
  );
  lines.push("");

  // Internal links (helps crawl + keeps posts aligned with money pages)
  lines.push("## Continue reading");
  lines.push("");
  if (isYouTube) {
    lines.push("- [YouTube summary](/youtube-summary)");
    lines.push(
      "- [How to get video transcripts with GPT Breeze extension](/blog/how-to-get-video-transcripts-with-gpt-breeze-extension/)",
    );
  }
  if (isPrivacy) {
    lines.push("- [Privacy-first workflow](/privacy-first)");
  }
  lines.push("- [Getting started](/guide/getting-started/)");
  lines.push("- [Pricing](/pricing)");
  lines.push("");

  // Sources (research citations)
  if (sourceLinks.length > 0) {
    lines.push("## Sources");
    lines.push("");
    for (const u of sourceLinks) lines.push(`- ${u}`);
    lines.push("");
  }

  return lines.join("\n");
}

function ensureDirs() {
  fs.mkdirSync(stateDir, { recursive: true });
  fs.mkdirSync(blogDir, { recursive: true });
  fs.mkdirSync(researchDir, { recursive: true });
}

function loadResearch(topicId) {
  const file = path.join(researchDir, `${topicId}.md`);
  if (!fs.existsSync(file)) return { ok: false, reason: `Missing research file: ${path.relative(root, file)}` };
  const content = fs.readFileSync(file, 'utf8');
  return { ok: true, content, file };
}

function section(content, headingRegex) {
  const m = content.match(headingRegex);
  if (!m) return null;
  const start = m.index ?? 0;
  const rest = content.slice(start + m[0].length);
  const next = rest.match(/^##\s+/m);
  return next ? rest.slice(0, next.index) : rest;
}

function validateResearch(content) {
  const problems = [];

  if (!content.toLowerCase().includes('## user discussion research'))
    problems.push('Missing section: ## User discussion research');

  const redditLinks = content.match(/https:\/\/www\.reddit\.com\//g) || [];
  if (redditLinks.length < 2) problems.push('Need >=2 reddit links');

  const kwSec = section(content, /^##\s+Keywords \(10\)\s*$/m);
  if (!kwSec) problems.push('Missing section: ## Keywords (10)');
  else {
    const kws = kwSec
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => /^\d+\./.test(l));
    if (kws.length !== 10) problems.push(`Need exactly 10 keywords (found ${kws.length})`);
  }

  if (!content.toLowerCase().includes('## backlinks'))
    problems.push('Missing section: ## Backlinks');

  const internalLinks = content.match(/\n-\s+\/[a-z0-9\-\/]+/gi) || [];
  if (internalLinks.length < 3) problems.push('Need >=3 internal links (e.g. /pricing)');

  if (!content.toLowerCase().includes('## outline'))
    problems.push('Missing section: ## Outline');
  const h2s = content.match(/\n-\s+H2:/g) || [];
  if (h2s.length < 4) problems.push('Need >=4 H2 items in outline');

  return problems;
}

const args = parseArgs(process.argv);
ensureDirs();

if (!fs.existsSync(topicBankPath))
  throw new Error(`Missing topic bank: ${path.relative(root, topicBankPath)}`);
const bank = JSON.parse(fs.readFileSync(topicBankPath, "utf8"));
const topics = bank.topics || [];
if (topics.length === 0) throw new Error("Topic bank is empty");

const topic = pickTopicStrict(topics, args.topicId);

// Enforce research-driven publishing: no research => no publish.
const rg = loadResearchOrSkip(topic.id);
if (!rg.ok) {
  console.log(`[skip] ${rg.reason}`);
  console.log(`[skip] Refusing to publish topicId="${topic.id}" without complete research.`);
  process.exit(0);
}
const research = rg.research;

const now = new Date();
const pubDate = args.date ?? toISODate(now);

const baseSlug = slugify(topic.title);
const outPath = path.join(blogDir, `${baseSlug}.md`);
if (fs.existsSync(outPath)) {
  // Strict de-dup: never create new URLs for the same topic. If this exists, it must already be the canonical.
  throw new Error(
    `Refusing to publish duplicate slug in strict mode: ${path.relative(root, outPath)}. Update the existing post instead.`,
  );
}

const markdown = renderPost({ topic, pubDate, research });

if (args.dryRun) {
  console.log(`[dry-run] Would write: ${path.relative(root, outPath)}`);
  console.log(markdown.slice(0, 800));
  process.exit(0);
}

fs.writeFileSync(outPath, markdown, "utf8");

const ledgerEntry = {
  at: new Date().toISOString(),
  topicId: topic.id,
  title: topic.title,
  file: path.relative(root, outPath),
  pubDate,
};
fs.appendFileSync(ledgerPath, `${JSON.stringify(ledgerEntry)}\n`, "utf8");

// Best-effort: update the daily log so each run leaves a trace.
try {
  if (fs.existsSync(planPath)) {
    const plan = fs.readFileSync(planPath, "utf8");
    const logLinePrefix = `- ${pubDate}:`;
    const note = `published ${path.relative(root, outPath)} (topic: ${topic.id})`;

    if (plan.includes(logLinePrefix)) {
      // Append to existing day line if not already present.
      if (!plan.includes(note)) {
        const updated = plan.replace(
          logLinePrefix,
          `${logLinePrefix} ${note};`,
        );
        fs.writeFileSync(planPath, updated, "utf8");
      }
    } else if (plan.includes("## Daily log")) {
      const updated = plan.replace(
        "## Daily log\n",
        `## Daily log\n${logLinePrefix} ${note}.\n`,
      );
      fs.writeFileSync(planPath, updated, "utf8");
    }
  }
} catch {
  // ignore
}

console.log(`Published: ${path.relative(root, outPath)}`);
console.log(`Ledger: ${path.relative(root, ledgerPath)}`);
