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
        canvas: {
          DEFAULT: "#F8FAFC",
          deep: "#F1F5F9",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          elevated: "#F8FAFC",
          card: "#FFFFFF",
          hover: "#F1F5F9",
        },
        border: {
          DEFAULT: "#E2E8F0",
          light: "#F1F5F9",
          active: "#CBD5E1",
          glow: "rgba(79, 70, 229, 0.2)",
        },
        brand: {
          DEFAULT: "#4F46E5",
          hover: "#4338CA",
          dark: "#3730A3",
          light: "#EEF2FF",
          glow: "rgba(79, 70, 229, 0.15)",
        },
        threat: {
          DEFAULT: "#DC2626",
          dark: "#B91C1C",
          light: "#FEF2F2",
          border: "#FECACA",
          glow: "rgba(220, 38, 38, 0.2)",
          muted: "rgba(220, 38, 38, 0.08)",
        },
        safe: {
          DEFAULT: "#059669",
          dark: "#047857",
          light: "#ECFDF5",
          border: "#A7F3D0",
          glow: "rgba(5, 150, 105, 0.2)",
          muted: "rgba(5, 150, 105, 0.08)",
        },
        legit: {
          DEFAULT: "#0284C7",
          dark: "#0369A1",
          light: "#F0F9FF",
          border: "#BAE6FD",
          glow: "rgba(2, 132, 199, 0.2)",
          muted: "rgba(2, 132, 199, 0.08)",
        },
        jewel: {
          DEFAULT: "#D97706",
          dark: "#B45309",
          light: "#FFFBEB",
          border: "#FDE68A",
          glow: "rgba(217, 119, 6, 0.2)",
          muted: "rgba(217, 119, 6, 0.08)",
        },
        text: {
          primary: "#0F172A",
          secondary: "#334155",
          muted: "#64748B",
          dim: "#94A3B8",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        mono: [
          "JetBrains Mono",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
      boxShadow: {
        sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        card: "0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.04)",
        cardHover: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.06)",
        float: "0 10px 25px -5px rgb(0 0 0 / 0.08), 0 8px 10px -6px rgb(0 0 0 / 0.04)",
        glow: "0 0 15px -2px rgba(79, 70, 229, 0.25)",
        threatGlow: "0 0 15px -2px rgba(220, 38, 38, 0.25)",
        safeGlow: "0 0 15px -2px rgba(5, 150, 105, 0.25)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "radar": "radar 4s linear infinite",
      },
      keyframes: {
        radar: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
