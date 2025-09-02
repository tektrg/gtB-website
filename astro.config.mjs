import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Adjust `site` to your final domain.
// For project sites under <username>.github.io/<repo>, uncomment `base`.
export default defineConfig({
  site: 'https://tektrg.github.io',
  base: '/gtB-website',
  integrations: [sitemap()],
});
