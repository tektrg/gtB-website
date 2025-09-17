import defaultTheme from "tailwindcss/defaultTheme";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Montserrat", ...defaultTheme.fontFamily.sans],
      },
      colors: {
        // Main theme colors
        "warm-dark": "#1C1C1C",
        "warm-light": "#F6F4F0",

        // Primary brand colors
        "brand-bg": "#F6F4F0",
        "brand-fg": "#22221F",
        "brand-muted": "#667085",
        "brand-accent": "#22221F",
        "brand-accent-fg": "#ffffff",

        // UI colors
        "ui-border": "#e3e1dc",
        "ui-surface": "#ffffff",

        // Accent colors
        "accent-blue": "#4BB7D7",
        "accent-blue-light": "rgba(75, 183, 215, 0.28)",
        "accent-star": "#FEC84B",

        // Blue variations
        "blue-light": "#EAF7FB",
        "blue-border": "#D0EEF7",
        "blue-100": "rgb(219, 234, 254)",
        "blue-700": "rgb(29, 78, 216)",

        // Gray scale
        "gray-100": "rgb(243, 244, 246)",
        "gray-200": "rgb(229, 231, 235)",
        "gray-400": "rgb(156, 163, 175)",
        "gray-500": "rgb(107, 114, 128)",
        "gray-600": "rgb(75, 85, 99)",
        "gray-700": "rgb(55, 65, 81)",
        "gray-800": "rgb(31, 41, 55)",
        "gray-900": "rgb(17, 24, 39)",

        // Black variations with opacity
        "black-50": "rgba(0, 0, 0, 0.5)",

        // Device frame colors
        "device-border": "rgba(208, 206, 205, 0.49)",

        // Placeholder colors
        "placeholder-text": "#a8a29e",
        "placeholder-bg-1": "#f6f4f0",
        "placeholder-bg-2": "#f1efe9",

        // Shadow colors
        "shadow-light": "rgba(16, 24, 40, 0.02)",
        "shadow-medium": "rgba(16, 24, 40, 0.1)",
        "shadow-dark": "rgba(16, 24, 40, 0.25)",

        // Header backdrop
        "header-backdrop": "rgba(246, 244, 240, 0.65)",
      },
    },
  },
  plugins: [],
};
