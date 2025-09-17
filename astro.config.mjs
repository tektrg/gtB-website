import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

import tailwind from "@astrojs/tailwind";

// Adjust `site` to your final domain.
// For project sites under <username>.github.io/<repo>, uncomment `base`.
export default defineConfig({
  // Allow overriding the canonical site via env for beta/preview deploys
  site: process.env.PUBLIC_SITE ?? "https://gptbreeze.io",
  // base removed for custom domain
  alias: {
    "@": "./src",
  },
  integrations: [sitemap(), tailwind()],
});
