# Telegram — Daily AUTONOMUS update template (GPT Breeze)

Copy/paste the **latest** run block from:
- `AUTONOMUS/reports/YYYY-MM-DD.md`

Keep the structure exactly like the report (append-only run log):

```md
GPT Breeze — Daily AUTONOMUS Report — YYYY-MM-DD

## Run @ HH:MM
**Shipped:**
- Blog: published (created: X, updated: Y, deleted: Z)
  - [Title](https://gptbreeze.io/blog/<slug>/) — <1-line description> (created|updated)
- Providers: published (created: X, updated: Y, deleted: Z)
  - [Title](https://gptbreeze.io/guide/providers/<slug>/) — <1-line description> (created|updated)

**Why:**
- Blog: <pillar> / <intent> (or skip reason)
- Providers: Provider setup / how-to (or skip reason)

**Checks:**
- seo:verify ✅
- check ✅

**Next:**
- Review Search Console queries: pick 1 new topic + 1 internal-link upgrade.
```

Notes:
- If nothing shipped, the generator writes `skipped (missing/incomplete research or no available topic)` — keep that line as-is.
- Prefer posting only ONE run block (the latest) per Telegram update.
