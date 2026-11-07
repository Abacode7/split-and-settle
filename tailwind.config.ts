import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
      },
      colors: {
        primary: {
          50: "#eefbf4",
          100: "#d6f5e3",
          200: "#b0eacc",
          300: "#7cdaae",
          400: "#46c28c",
          500: "#24a873",
          600: "#17885c",
          700: "#136d4c",
          800: "#12563e",
          900: "#104734",
          950: "#07281e",
        },
        accent: {
          50: "#fefce8",
          100: "#fef9c3",
          200: "#fef08a",
          300: "#fde047",
          400: "#facc15",
          500: "#eab308",
          600: "#ca8a04",
          700: "#a16207",
        },
        surface: {
          50: "#fafaf9",
          100: "#f5f5f4",
          200: "#e7e5e4",
          300: "#d6d3d1",
          400: "#a8a29e",
          500: "#78716c",
          600: "#57534e",
          700: "#44403c",
          800: "#292524",
          900: "#1c1917",
        },
      },
      boxShadow: {
        "glass": "0 0 0 1px rgba(255,255,255,0.1), 0 8px 40px -8px rgba(0,0,0,0.08)",
        "glass-lg": "0 0 0 1px rgba(255,255,255,0.15), 0 16px 60px -12px rgba(0,0,0,0.12)",
        "card": "0 1px 3px rgba(0,0,0,0.04), 0 6px 24px rgba(0,0,0,0.06)",
        "card-hover": "0 2px 8px rgba(0,0,0,0.06), 0 12px 40px rgba(0,0,0,0.1)",
        "glow": "0 0 20px rgba(36,168,115,0.15)",
        "glow-lg": "0 0 40px rgba(36,168,115,0.2)",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      animation: {
        "fade-in": "fade-in 0.5s ease-out",
        "fade-up": "fade-up 0.5s ease-out",
        "fade-up-1": "fade-up 0.5s ease-out 0.1s both",
        "fade-up-2": "fade-up 0.5s ease-out 0.2s both",
        "fade-up-3": "fade-up 0.5s ease-out 0.3s both",
        "fade-up-4": "fade-up 0.5s ease-out 0.4s both",
        "scale-in": "scale-in 0.3s ease-out",
        "slide-down": "slide-down 0.3s ease-out",
        "slide-up": "slide-up 0.3s ease-out",
        "shimmer": "shimmer 2s infinite linear",
        "pulse-soft": "pulse-soft 3s infinite ease-in-out",
        "progress": "progress 1s ease-out",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "slide-down": {
          from: { opacity: "0", transform: "translate(-50%, -20px)" },
          to: { opacity: "1", transform: "translate(-50%, 0)" },
        },
        "slide-up": {
          from: { transform: "translateY(100%)" },
          to: { transform: "translateY(0)" },
        },
        "shimmer": {
          from: { backgroundPosition: "-200% 0" },
          to: { backgroundPosition: "200% 0" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        "progress": {
          from: { width: "0%" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
