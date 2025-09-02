# Astro + GitHub Pages — SEO-ready, CMS-free, ship-fast setup

You: Claude on laptop → Markdown/MDX in repo → Astro builds → GitHub Pages deploys. No database, no “admin panel,” no whiny plugins. Here’s the exact path.

---

## 0) Repo + Pages mode

* Create your GitHub repo (user site: `<username>.github.io` or any project repo).
* In **Settings → Pages**, set **Source = GitHub Actions**. Astro ships an official action; we’ll use that. ([Astro Documentation][1])

---

## 1) Scaffold Astro locally

```bash
# pick one
npm create astro@latest
# or
pnpm create astro@latest
```

Follow the wizard (choose “Blog” or “Minimal”). Run it:

```bash
npm i && npm run dev
```

Astro’s `create astro` is the recommended way to bootstrap projects. ([Astro Documentation][2])

Commit and push to `main`.

---

## 2) Configure Astro for GitHub Pages URLs

Astro needs your final URL and, for project sites, a **base path**.

**`astro.config.mjs`**

```js
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://<username>.github.io',  // or your custom domain later
  // For project sites (https://<username>.github.io/<repo>), uncomment:
  // base: '/<repo>'
});
```

* `site` enables correct canonical URLs & feeds.
* `base` is required for project repos so links/assets resolve under `/<repo>`. ([Astro Documentation][1])

---

## 3) Deploy via the official Astro GitHub Action

Create **`.github/workflows/deploy.yml`**:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  # Daily rebuild to publish “future-dated” posts once their time arrives
  schedule:
    - cron: "10 0 * * *"  # 00:10 UTC = 07:10 Asia/Ho_Chi_Minh
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install, build, and upload your site
        uses: withastro/action@v3
        # with:
        #   node-version: 20
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

* `withastro/action@v3` builds & uploads; `deploy-pages@v4` publishes.
* `schedule` uses POSIX cron and runs in **UTC** (Astro is static; you need a cron to “wake up” for scheduled posts). ([Astro Documentation][1], [GitHub][3], [GitHub Docs][4])

---

## 4) Model your content (types, validation, no surprises)

Use **Content Collections** to enforce front-matter with Zod.

**`src/content.config.ts`**

```ts
import { defineCollection, z } from 'astro:content';

export const blog = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string().min(40),
    pubDate: z.coerce.date(),   // publish time
    updatedDate: z.coerce.date().optional(),
    slug: z.string().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    canonicalURL: z.string().url().optional(),
  })
});

export const collections = { blog };
```

Why bother? You’ll catch missing SEO fields before deploy, not after Google crawls your mistake. ([Astro Documentation][5])

**Add a post** in `src/content/blog/2025-09-02-my-post.md`:

```md
---
title: "How I Outranked Myself"
description: "Fixing cannibalization across category pages."
pubDate: 2025-09-03T09:00:00+07:00
tags: ["seo","ecommerce"]
draft: false
canonicalURL: "https://example.com/outrank-myself"
---
Content…
```

---

## 5) List & render posts (filter drafts, sort by date)

**`src/pages/blog/index.astro`**

```astro
---
import { getCollection } from 'astro:content';
const now = new Date();
const posts = (await getCollection('blog', ({ data }) =>
  !data.draft && new Date(data.pubDate) <= now
)).sort((a, b) => +b.data.pubDate - +a.data.pubDate);
---
<html><body>
  <h1>Blog</h1>
  <ul>
    {posts.map((p) => (
      <li><a href={`/blog/${p.slug ?? p.id}/`}>{p.data.title}</a></li>
    ))}
  </ul>
</body></html>
```

Collection helpers and sorting are the recommended approach. ([Astro Documentation][5])

**`src/pages/blog/[...slug].astro`** (render a single post):

```astro
---
import { getCollection } from 'astro:content';
const { slug } = Astro.params;
const posts = await getCollection('blog');
const post = posts.find(p => (p.slug ?? p.id) === slug);
if (!post) throw new Error('Not found');
const { Content, headings } = await post.render();
---
<html><body>
  <article>
    <h1>{post.data.title}</h1>
    <Content />
  </article>
</body></html>
```

---

## 6) SEO basics (sitemap + RSS + robots + canonicals)

* **Sitemap** (official integration)

  ```bash
  npx astro add sitemap
  ```

  **`astro.config.mjs`**

  ```js
  import sitemap from '@astrojs/sitemap';
  export default defineConfig({
    site: 'https://<username>.github.io',
    // base: '/<repo>',
    integrations: [sitemap()]
  });
  ```

  Generates `sitemap-index.xml` automatically; add a `<link rel="sitemap">` or `robots.txt` if you want. ([Astro Documentation][6])

* **RSS**

  ```bash
  npm i @astrojs/rss
  ```

  **`src/pages/rss.xml.js`**

  ```js
  import rss from '@astrojs/rss';
  import { getCollection } from 'astro:content';

  export async function GET({ site }) {
    const posts = await getCollection('blog', ({ data }) => !data.draft);
    return rss({
      title: 'Your Blog',
      description: 'Fresh takes, no fluff',
      site,
      items: posts
        .filter(p => new Date(p.data.pubDate) <= new Date())
        .map(p => ({
          title: p.data.title,
          description: p.data.description,
          pubDate: p.data.pubDate,
          link: `/blog/${p.slug ?? p.id}/`
        })),
    });
  }
  ```

  Official recipe uses an endpoint + `@astrojs/rss`. ([Astro Documentation][7])

* **Custom domain** later? Add `public/CNAME` and set `site` to your domain, then drop `base`. ([Astro Documentation][1])

---

## 7) Images that don’t tank Core Web Vitals

* Use Astro’s built-in `<Image />` / `<Picture />` for responsive, optimized output.
  Store local images under `src/assets` and import them. ([Astro Documentation][8])
* For big batches (hero images, screenshots), compress in CI with Squoosh CLI:

  ```bash
  npx @squoosh/cli --webp auto src/assets/* -d src/assets/
  ```

  It’s a simple, parallelized image compressor. ([npm][9])

---

## 8) CI guardrails (because future-you is forgetful)

Add a **link checker** job with Lychee to catch rot before you deploy:

```yaml
  linkcheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: lycheeverse/lychee-action@v2
        with:
          args: --verbose --no-progress --exclude-mail --accept 200,206,429 --max-concurrency 8 .
```

Lychee Action checks links across HTML/Markdown. ([GitHub][10], [Docs][11])

---

## 9) Your daily flow (Claude → Markdown → push)

1. Draft in Claude, paste into `src/content/blog/*.md` with valid front-matter.
2. `npm run dev` locally, sanity check.
3. `git push`. Action deploys. Scheduled posts go live on the next cron run after their `pubDate` (remember: GitHub cron is UTC and not guaranteed to fire at the exact minute—close enough for content). ([GitHub Docs][4], [GitHub][12])

---

## Common faceplants (and how to dodge them)

* **Wrong URLs on project sites**: you forgot `base: '/<repo>'`. Fix it; all internal links must include the base. ([Astro Documentation][1])
* **Future post didn’t publish**: cron didn’t run yet; it’s UTC; patience or run `workflow_dispatch`. ([GitHub Docs][4])
* **Weird canonical/feed links**: you didn’t set `site`. Set it. ([Astro Documentation][13])
* **Images aren’t optimized**: you used raw `<img>` in Markdown without Astro’s assets pipeline; switch to `<Image />` for local assets or compress beforehand. ([Astro Documentation][8])

---

## Quick checklist (copy/paste and be done)

* Repo created; **Pages = Actions** ✔︎ ([Astro Documentation][1])
* `site` (and `base` if project site) ✔︎ ([Astro Documentation][13])
* `withastro/action@v3` + `deploy-pages@v4` workflow ✔︎ ([Astro Documentation][1], [GitHub][3])
* Content Collections schema with Zod ✔︎ ([Astro Documentation][5])
* `npx astro add sitemap` + `@astrojs/rss` endpoint ✔︎ ([Astro Documentation][6])
* Lychee link check ✔︎ ([GitHub][10])
* Optional images CI with Squoosh ✔︎ ([npm][9])

---

## Brutal verdict

Solo dev, Git-native content, static deploys, and an action that does the boring parts for you. It’s fast. It’s cheap. It’s not a CMS—because you don’t need one. If you ever add non-technical authors, we’ll bolt on a Git-based CMS later without torching this stack.

Want me to drop a ready-to-fork Astro template with all of the above baked in (sitemap, RSS, cron, link check, image compress stub)? Say so, and I’ll hand you the repo skeleton.

[1]: https://docs.astro.build/en/guides/deploy/github/ "Deploy your Astro Site to GitHub Pages | Docs"
[2]: https://docs.astro.build/en/tutorial/1-setup/2/?utm_source=chatgpt.com "Build a blog tutorial: Create your first Astro project | Docs"
[3]: https://github.com/actions/deploy-pages?utm_source=chatgpt.com "actions/deploy-pages"
[4]: https://docs.github.com/actions/reference/workflow-syntax-for-github-actions?utm_source=chatgpt.com "Workflow syntax for GitHub Actions"
[5]: https://docs.astro.build/en/guides/content-collections/ "Content collections | Docs"
[6]: https://docs.astro.build/en/guides/integrations-guide/sitemap/ "@astrojs/sitemap | Docs"
[7]: https://docs.astro.build/en/recipes/rss/ "Add an RSS feed | Docs"
[8]: https://docs.astro.build/en/guides/images/?utm_source=chatgpt.com "Images - Astro Docs"
[9]: https://www.npmjs.com/package/%40squoosh/cli?utm_source=chatgpt.com "squoosh/cli"
[10]: https://github.com/lycheeverse/lychee-action?utm_source=chatgpt.com "lycheeverse/lychee-action"
[11]: https://lychee.cli.rs/github-action/?utm_source=chatgpt.com "Github Action | Docs"
[12]: https://github.com/orgs/community/discussions/158356?utm_source=chatgpt.com "GitHub Actions Cron Schedule for Running Once in 2 Weeks"
[13]: https://docs.astro.build/en/reference/configuration-reference/ "Configuration Reference | Docs"
