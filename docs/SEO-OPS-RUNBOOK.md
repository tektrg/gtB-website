# SEO Ops Runbook — GPTBreeze.io

This is the **step-by-step procedure** to run “SEO ops” for the GPT Breeze website.

Repo: https://github.com/tektrg/gtB-website
Site: https://gptbreeze.io

---

## 0) One-time setup (local)

```bash
cd gtB-website
npm i
```

Sanity checks:

```bash
npm run check
npm run seo:verify
```

---

## 1) Understand what “SEO ops” means (definition of done)

A complete SEO ops run ships **one improvement** and reports it clearly.

**Default package (do these in order):**
1. **Pick target**: choose 1 pillar + 1 intent (from `docs/SEO-op-alignment.md` + current priorities).
2. **Ship**: either publish 1 new page OR upgrade 1 existing page.
3. **Link**: add/adjust internal links to 1–2 relevant money pages (pricing/privacy/getting-started/feature pages).
4. **Verify**: `npm run seo:verify` + `npm run check`.
5. **Report**: post Shipped + Why + Checks + Next.

---

## 2) Daily run (content publish)

### 2.0 Maintain the topic bank (this is part of the job)

`AUTONOMUS/content/topic-bank.json` is the **publish allowlist**. If it’s stale, AUTONOMUS will publish stale ideas.

Rules:
- Every topic must map to a cluster in `docs/SEO-op-alignment.md` (YouTube summarizer / web summary / shortcuts / BYOK+privacy / comparisons / provider setup / use-cases).
- Prefer **user-intent** titles (how-to, alternative, comparison, checklist).
- Add lightweight metadata to each topic (used for review): `pillar`, `intent`, `tags`, `sections`.
- Remove anything that’s “SEO meta for builders” unless Trung explicitly asks.

Cadence:
- Minimum: add **5–10 new topics/week** after reviewing Search Console.

### 2.1 Research requirement (must exist before publish)

Before a topic is allowed to publish, it must have a research artifact:
- `AUTONOMUS/research/blog/<topicId>.md`

Create the research file template:

```bash
node AUTONOMUS/tools/init-topic-research.mjs --topic <topicId>
```

Then fill it with:
- 3–8 user discussion links (Reddit/X)
- pain points
- **10 keywords**
- backlink plan (internal money pages + related pages)

If the research file is missing or incomplete, the publisher will refuse to publish.

Before publishing, confirm the topic is aligned:
- Audience: GPT Breeze users (not “SEO for bloggers/builders”)
- Pillar: YouTube summary / web summary / shortcuts / BYOM privacy+security / pricing+comparisons / provider setup
- Has at least 1–2 natural internal links to money pages (`/pricing`, `/privacy-first`, `/guide/getting-started/`, feature pages)

### 2.1 Research requirement (before publishing)

AUTONOMUS will **refuse to publish** a blog topic unless there is a research artifact at:

- `AUTONOMUS/research/blog/<topicId>.md`

Seed a template:

```bash
node AUTONOMUS/tools/research-seed.mjs --topic <topicId>
```

Minimum required in research:
- ≥2 Reddit links
- exactly 10 keywords under `## Keywords (10)`
- ≥3 internal links under `## Backlinks`
- ≥4 H2 items under `## Outline`

Verify a research file:

```bash
node AUTONOMUS/tools/research-verify.mjs --topic <topicId>
```

### 2.2 Publish the daily post (AUTONOMUS)

```bash
npm run seo:publish:daily
```

This runs:
- `AUTONOMUS/tools/publish-daily-post.mjs` (picks next unused topic from `AUTONOMUS/content/topic-bank.json`)
- research gate (must exist + be complete)
- `npm run seo:verify`

### 2.2 STRICT de-dup policy (important)

Publishing is **strict**:
- **One topic → one canonical URL**.
- The publisher will **refuse** to create `-2/-3/-4` duplicates.
- If you truly need another article, add a **new topicId** to the topic bank.

Rotation state:
- `AUTONOMUS/state/published.jsonl` is committed so CI + local keep the same rotation history.

Troubleshooting:
- If you see: **"Topic bank exhausted (strict mode)"** → add more topics to `AUTONOMUS/content/topic-bank.json`.
- If you see: **"Refusing to publish duplicate slug"** → update the existing canonical post instead of publishing.

---

## 3) Daily run (provider guide publish)

### 3.1 Publish the next provider guide

```bash
node AUTONOMUS/tools/publish-provider-guide.mjs
npm run seo:verify
npm run check
```

How it chooses the provider:
- Skips providers that already have a file in `src/content/guide/providers/*.md`.
- Uses a Phase-1 priority list first (OpenAI, Anthropic, Google, OpenRouter, Groq, Mistral, Together, Ollama, LM Studio, gateways, Azure), then falls back to “highest model count”.

To force a specific provider:

```bash
node AUTONOMUS/tools/publish-provider-guide.mjs --provider groq
```

### 3.2 (Optional) refresh provider inventory snapshot

This is for debugging/auditing the provider catalog (not required for daily publish):

```bash
node AUTONOMUS/tools/providers-index.mjs
```

---

## 4) Commit + push (required for deploy)

```bash
git status
# inspect diffs

git add -A

git commit -m "SEO: <short description>"

git push
```

Then watch GitHub Actions deploy for `main`.

---

## 5) Report format (Telegram)

Use this template (keeps expectation aligned):

- **Shipped:** <links>
- **Why:** pillar + intent (what query/user job it targets)
- **Checks:** `seo:verify` + `check` (pass)
- **Next:** 1 topic + 1 internal-link upgrade

---

## 6) Weekly loop (measurement → prioritization)

Once/week (30–45 min):
- Review Google Search Console queries/pages:
  - impressions high, CTR low → rewrite title/meta
  - ranking 8–20 → add internal links + expand content
  - cannibalization → consolidate + redirects

Outputs:
- 5 topic briefs to add to `topic-bank.json`
- 5 pages to refresh (internal links + content upgrades)

---

## 7) Notes

- “SEO ops” is not just publishing. If we publish without pillars/intent/internal linking, we accumulate pages without a ranking plan.
