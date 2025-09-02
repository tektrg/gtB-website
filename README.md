# GPTB Website (Astro + GitHub Pages)

Static, CMS-free blog powered by Astro, deployed via GitHub Pages Actions.

## Quick Start

- Install deps: `npm i`
- Dev server: `npm run dev`
- Build: `npm run build`
- Preview: `npm run preview`

## Configure URLs

- Edit `astro.config.mjs`:
  - Set `site` to your domain (e.g. `https://<username>.github.io`).
  - For project sites, uncomment and set `base: '/<repo>'`.

## Content Collections

- Schema lives in `src/content.config.ts` (validated with Zod).
- Add posts in `src/content/blog/*.md` with front-matter fields required by the schema.

## Blog Pages

- List: `src/pages/blog/index.astro`
- Post: `src/pages/blog/[...slug].astro`
- RSS: `src/pages/rss.xml.js`

## Deploy (GitHub Pages)

- Workflow: `.github/workflows/deploy.yml` uses `withastro/action@v3` to build and `actions/deploy-pages@v4` to publish.
- Includes a daily cron for scheduled posts and a Lychee link checker job.

## Notes

- To use sitemap, `@astrojs/sitemap` is already configured in `astro.config.mjs`.
- For a custom domain, add `public/CNAME` and set `site` to that domain.

