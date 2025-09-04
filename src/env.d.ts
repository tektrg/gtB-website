/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

// Public env vars used by the app
interface ImportMetaEnv {
  readonly PUBLIC_SITE?: string;
  readonly PUBLIC_NOINDEX?: string; // '1' | 'true' to enable
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
