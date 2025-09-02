# Repository Guidelines

## Project Structure & Module Organization
- `src/pages/`: Astro pages (home, blog list, post routes).
- `src/layouts/`: Shared layouts (SEO/meta).
- `src/content/`: Git-native content.
  - `src/content/blog/YYYY-MM-DD-slug.md` (front‑matter validated by Zod).
- `src/assets/`: Local images and static assets.
- `public/`: Served as-is (e.g., `CNAME`, `robots.txt`).
- `astro.config.mjs`: Site/base URLs and integrations.
- `.github/workflows/`: CI for build, deploy, link check.

## Build, Test, and Development Commands
- `npm run dev`: Start local dev server with hot reload.
- `npm run build`: Produce static site in `dist/`.
- `npm run preview`: Serve the production build locally.
- `npm run check`: Type/syntax checks for Astro project.
- `npm run format`: Prettier format across the repo.

## Coding Style & Naming Conventions
- Indentation: 2 spaces; keep files small and focused.
- Languages: Astro, TypeScript (strict), Markdown/MDX.
- Formatting: Prettier (run `npm run format` before PRs).
- Content filenames: `YYYY-MM-DD-slug.md` under `src/content/blog/`.
- Front‑matter required: `title`, `description` (≥40 chars), `pubDate`; optional `tags`, `canonicalURL`, `draft`.

## Testing Guidelines
- No runtime test suite yet. Use:
  - `npm run check` to validate types and Astro syntax.
  - CI link check via Lychee runs on PRs and main.
- When adding tests, follow `__tests__/` co-located with feature folders and name as `<feature>.test.(ts|js)`.

## Commit & Pull Request Guidelines
- Commits: Conventional Commits (e.g., `feat:`, `fix:`, `chore:`). Examples:
  - `feat: add Base SEO layout`
  - `chore: set custom domain and CNAME`
- PRs must include:
  - Summary, screenshots for UI changes, and linked issues.
  - Checklist: `npm run format` passed; local `build` and `preview` verified.

## Security & Configuration Tips
- Set `site` (and `base` for project sites) in `astro.config.mjs`.
- Custom domain: add `public/CNAME` and enable HTTPS in Pages.
- Do not commit secrets; this site deploys without repository secrets.
