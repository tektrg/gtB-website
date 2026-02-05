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

function pickTopic(topics, ledger, forcedId) {
  if (forcedId) {
    const t = topics.find((x) => x.id === forcedId);
    if (!t) throw new Error(`Unknown topic id: ${forcedId}`);
    return t;
  }

  const used = new Set(ledger.map((x) => x.topicId));
  const unused = topics.filter((t) => !used.has(t.id));
  if (unused.length === 0) {
    // If everything was used, restart the rotation.
    return topics[0];
  }
  return unused[0];
}

function uniquePathForSlug(baseSlug) {
  let slug = baseSlug;
  let n = 2;
  while (fs.existsSync(path.join(blogDir, `${slug}.md`))) {
    slug = `${baseSlug}-${n}`;
    n++;
  }
  return path.join(blogDir, `${slug}.md`);
}

function mdEscapeInline(text) {
  return String(text).replace(/\n/g, " ").trim();
}

function renderPost({ topic, pubDate }) {
  const title = topic.title;
  const description = topic.description;
  const tags = topic.tags || [];

  const lines = [];
  lines.push("---");
  lines.push(`title: "${mdEscapeInline(title).replace(/"/g, '\\"')}"`);
  lines.push(
    `description: "${mdEscapeInline(description).replace(/"/g, '\\"')}"`,
  );
  lines.push(`pubDate: ${pubDate}T00:00:00.000Z`);
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

    // Default: keep useful without pretending we know specifics.
    lines.push(
      "Use checklists, safe defaults, and clear failure modes. Avoid settings that silently increase access to pages, tabs, or stored data.",
    );
    lines.push("");
  }

  lines.push("---");
  lines.push("");
  lines.push(
    "Want faster workflows without sacrificing control? GPT Breeze is built for BYOM-style flexibility with a privacy-first mindset.",
  );
  lines.push("");

  return lines.join("\n");
}

function ensureDirs() {
  fs.mkdirSync(stateDir, { recursive: true });
  fs.mkdirSync(blogDir, { recursive: true });
}

const args = parseArgs(process.argv);
ensureDirs();

if (!fs.existsSync(topicBankPath))
  throw new Error(`Missing topic bank: ${path.relative(root, topicBankPath)}`);
const bank = JSON.parse(fs.readFileSync(topicBankPath, "utf8"));
const topics = bank.topics || [];
if (topics.length === 0) throw new Error("Topic bank is empty");

const ledger = loadLedger();
const topic = pickTopic(topics, ledger, args.topicId);

const now = new Date();
const pubDate = args.date ?? toISODate(now);

const baseSlug = slugify(topic.title);
const outPath = uniquePathForSlug(baseSlug);

const markdown = renderPost({ topic, pubDate });

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
