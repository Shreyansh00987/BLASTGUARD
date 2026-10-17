import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        canvas: "#0A0B0E",
        surface: {
          DEFAULT: "#12151C",
          elevated: "#1A1F2B",
          subtle: "#161922",
        },
        border: {
          DEFAULT: "#262D3D",
          light: "#333D52",
          active: "#4F5D7E",
        },
        brand: {
          DEFAULT: "#8B5CF6",
          hover: "#A78BFA",
          dark: "#6D28D9",
          muted: "rgba(139, 92, 246, 0.15)",
        },
        status: {
          critical: "#EF4444",
          verified: "#10B981",
          warning: "#F59E0B",
          info: "#3B82F6",
        },
        text: {
          primary: "#F8FAFC",
          secondary: "#94A3B8",
          muted: "#64748B",
        },
      },
      fontFamily: {
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "Liberation Mono",
          "Courier New",
          "monospace",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
