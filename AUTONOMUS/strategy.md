# GPTBreeze.io — Holistic SEO Strategy (working doc)

This is the **explicit plan** behind “SEO ops” so we don’t confuse *publishing automation* with *ranking strategy*.

## 1) Goal + constraints

**Goal:** grow qualified organic traffic that converts into Chrome Web Store installs.

**Constraints:**
- Static site (Astro + GitHub Pages) — great for speed/SEO; no backend.
- We must avoid keyword cannibalization (no near-duplicate posts fighting each other).

## 2) What we ship (4 layers)

### Layer A — Technical foundation (always-on)
- Clean canonical URLs, sitemap, robots, fast pages.
- Structured data on key pages (Article/FAQ/Product/SoftwareApplication as appropriate).
- Build gates:
  - `npm run check`
  - `npm run seo:verify` (frontmatter + minimum content quality)

### Layer B — Information architecture (pillars)
Pick a small set of pillars; every new page must map to one pillar.

Recommended pillars for GPT Breeze:
1. **YouTube summary** (feature + use cases)
2. **Web/article summary** (feature + workflows)
3. **Prompt shortcuts / productivity** (how-to, workflows)
4. **BYOM/BYOK privacy & security** (differentiation + trust)
5. **Pricing & comparisons** (high-intent conversion)

### Layer C — Content strategy (clusters)
For each pillar:
- 1 “pillar page” (broad, evergreen)
- 8–20 “cluster pages” (specific queries)

Content types:
- How-to (task driven)
- Alternatives (comparison)
- Pricing/model cost (intent)
- Setup guides (providers / local LLMs)

### Layer D — Internal linking + conversion
Rules:
- Each new post must link to **1–2 relevant money pages** (pricing/privacy/getting-started/feature pages).
- Each money page should link back to its supporting clusters.
- Use consistent anchor phrases (small curated set) to avoid random anchors.

## 3) De-dup policy (STRICT)

**One topic → one canonical URL.**
- AUTONOMUS daily publish is **strict**: it will not create `-2/-3/-4` duplicates.
- If a duplicate slug ever exists, we:
  1) keep one canonical post
  2) replace old duplicates with **301 redirects** to the canonical

## 4) Measurement loop (how we pick next work)

Weekly cadence (30–45 min):
- Review Google Search Console:
  - queries with impressions but low CTR → improve title/meta + snippet
  - pages ranking 8–20 → add internal links + expand sections
  - cannibalization signals → consolidate + redirects

Success metrics:
- Primary: Chrome Web Store installs (or clickouts)
- Leading indicators:
  - organic sessions
  - impressions/clicks (GSC)
  - pages in top 10 / top 3

## 5) Communication contract (no more ambiguity)

When someone says “run SEO ops”, we will report back with:
- **What shipped** (links)
- **Why this page** (pillar + target query intent)
- **What changed technically** (if any)
- **Next 1–3 actions**

Default update message format (Telegram):
- Shipped: <links>
- Checks: seo:verify/check/build
- Next: <1 topic + 1 internal-link upgrade>
