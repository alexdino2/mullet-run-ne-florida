import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ocean: {
          50: "#eefbff",
          100: "#d6f3fd",
          200: "#b0e8fb",
          300: "#78d7f7",
          400: "#38bdec",
          500: "#0fa0d8",
          600: "#0480b6",
          700: "#096694",
          800: "#0f5479",
          900: "#124766",
          950: "#0a2d44",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-body)",
          "var(--font-system)",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
        display: [
          "var(--font-display)",
          "var(--font-body)",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
