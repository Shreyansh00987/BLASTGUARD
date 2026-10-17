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
          DEFAULT: "#060709",
          deep: "#040507",
        },
        surface: {
          DEFAULT: "#0D1017",
          elevated: "#151A24",
          card: "#121620",
          hover: "#1A202C",
        },
        border: {
          DEFAULT: "#1E2536",
          light: "#2A344A",
          active: "#3D4B68",
          glow: "rgba(139, 92, 246, 0.4)",
        },
        brand: {
          DEFAULT: "#8B5CF6",
          hover: "#A78BFA",
          dark: "#6D28D9",
          glow: "rgba(139, 92, 246, 0.25)",
        },
        threat: {
          DEFAULT: "#FF3B30",
          glow: "rgba(255, 59, 48, 0.25)",
          muted: "rgba(255, 59, 48, 0.12)",
        },
        safe: {
          DEFAULT: "#10B981",
          glow: "rgba(16, 185, 129, 0.25)",
          muted: "rgba(16, 185, 129, 0.12)",
        },
        legit: {
          DEFAULT: "#06B6D4",
          glow: "rgba(6, 182, 212, 0.25)",
          muted: "rgba(6, 182, 212, 0.12)",
        },
        jewel: {
          DEFAULT: "#F59E0B",
          glow: "rgba(245, 158, 11, 0.25)",
          muted: "rgba(245, 158, 11, 0.12)",
        },
        text: {
          primary: "#FFFFFF",
          secondary: "#CBD5E1",
          muted: "#718096",
          dim: "#4A5568",
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
        glow: "0 0 20px -3px rgba(139, 92, 246, 0.3)",
        threatGlow: "0 0 20px -3px rgba(239, 68, 68, 0.35)",
        safeGlow: "0 0 20px -3px rgba(16, 185, 129, 0.35)",
        card: "0 4px 20px -2px rgba(0, 0, 0, 0.5)",
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
