import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./content/**/*.mdx",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#03060d",
          900: "#060a14",
          850: "#090f1d",
          800: "#0c1426",
          700: "#15203a",
        },
        cyber: {
          cyan: "#22d3ee",
          teal: "#2dd4bf",
          violet: "#a78bfa",
          amber: "#fbbf24",
          rose: "#fb7185",
          lime: "#a3e635",
          blue: "#60a5fa",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        glow: "0 0 40px -12px rgba(34, 211, 238, 0.45)",
        "glow-violet": "0 0 40px -12px rgba(167, 139, 250, 0.5)",
        panel: "0 24px 80px -32px rgba(0, 0, 0, 0.9)",
      },
      backgroundImage: {
        "grid-fade":
          "linear-gradient(to bottom, rgba(3,6,13,0) 0%, #03060d 100%), linear-gradient(rgba(148,163,184,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.07) 1px, transparent 1px)",
      },
      backgroundSize: {
        grid: "100% 100%, 44px 44px, 44px 44px",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "pulse-ring": {
          "0%": { opacity: "0.6", transform: "scale(0.95)" },
          "70%": { opacity: "0", transform: "scale(1.35)" },
          "100%": { opacity: "0", transform: "scale(1.35)" },
        },
        "slide-dash": {
          "to": { strokeDashoffset: "-24" },
        },
      },
      animation: {
        float: "float 7s ease-in-out infinite",
        "pulse-ring": "pulse-ring 2.8s ease-out infinite",
        "slide-dash": "slide-dash 1.4s linear infinite",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
