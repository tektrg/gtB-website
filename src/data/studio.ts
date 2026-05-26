export const STUDIO_CONTACT_EMAIL = "yourfriend@theindie.app";
export const STUDIO_HOME_URL = "https://theindie.app/";

export const STUDIO_LIVE_APPS = [
  {
    name: "FastTab",
    href: "https://fasttab.theindie.app",
  },
  {
    name: "Strider",
    href: "https://strider.theindie.app",
  },
  {
    name: "Pineapple Log",
    href: "https://pineapplelog.theindie.app",
  },
  {
    name: "GPT Breeze",
    href: "https://gptbreeze.io",
  },
  {
    name: "SpeechToDo",
    href: "https://speechtodo.com",
  },
  {
    name: "SheetCanvas",
    href: "https://sheetcanvas.com",
  },
] as const;

export const STUDIO_FOUNDERS = [
  {
    name: "Stv L",
    href: "https://x.com/tektrg",
  },
  {
    name: "Duy Thanh",
    href: "https://x.com/p_d_d_t",
  },
] as const;

export const STUDIO_ORGANIZATION_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "theindie.app",
  url: STUDIO_HOME_URL,
  email: STUDIO_CONTACT_EMAIL,
  description:
    "theindie.app is a founder-led indie studio building small, focused software products.",
  founder: STUDIO_FOUNDERS.map((founder) => ({
    "@type": "Person",
    name: founder.name,
    url: founder.href,
  })),
  sameAs: [
    ...STUDIO_LIVE_APPS.map((app) => app.href),
    ...STUDIO_FOUNDERS.map((founder) => founder.href),
  ],
} as const;
