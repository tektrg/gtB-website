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

Before publishing, confirm the topic is aligned:
- Audience: GPT Breeze users (not “SEO for bloggers/builders”)
- Pillar: YouTube summary / web summary / shortcuts / BYOM privacy+security / pricing+comparisons / provider setup
- Has at least 1–2 natural internal links to money pages (`/pricing`, `/privacy-first`, `/guide/getting-started/`, feature pages)

### 2.1 Publish the daily post (AUTONOMUS)

```bash
npm run seo:publish:daily
```

This runs:
- `AUTONOMUS/tools/publish-daily-post.mjs` (generates a blog post from `AUTONOMUS/content/topic-bank.json`)
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

If provider automation is enabled/desired:

```bash
node AUTONOMUS/tools/publish-provider-guide.mjs
npm run seo:verify
npm run check
```

(If `publish-provider-guide.mjs` depends on a queue, update `AUTONOMUS/tools/providers-index.mjs` + its inputs first.)

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
