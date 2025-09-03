import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Adjust `site` to your final domain.
// For project sites under <username>.github.io/<repo>, uncomment `base`.
export default defineConfig({
  site: 'https://gptbreeze.io',
  // base removed for custom domain
  alias: {
    '@': './src',
  },
  integrations: [sitemap()],
});
