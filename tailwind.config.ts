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
        // Light LMS surfaces. The names are retained so existing components
        // pick up the new theme without a wholesale class rename.
        ink: {
          950: "#F7F6FB",
          900: "#FFFFFF",
          850: "#FFFFFF",
          800: "#F3F1FA",
          700: "#E9E6F4",
        },
        mist: {
          50: "#FBFAFE",
          100: "#F5F3FA",
          200: "#EFECF7",
          300: "#E4E0F0",
        },
        line: {
          DEFAULT: "#E7E4F1",
          strong: "#D7D2E8",
        },
        navy: "#140342",
        body: "#5B5876",
        muted: "#8B88A3",
        brand: {
          50: "#F3F0FF",
          100: "#EAE4FF",
          200: "#D8CDFF",
          300: "#BCA8FF",
          400: "#9B7BFA",
          500: "#7C5CFC",
          600: "#6C4DF6",
          700: "#5B3DD8",
          800: "#4A32AE",
          900: "#2E1D73",
        },
        coral: {
          50: "#FFF2F0",
          100: "#FFE3DE",
          200: "#FFC8BF",
          300: "#FCA79A",
          400: "#F78675",
          500: "#F26B5B",
          600: "#E25545",
          700: "#C24134",
        },
        gold: {
          50: "#FFF9EB",
          100: "#FFF0C9",
          200: "#FFE19B",
          300: "#F9CD66",
          400: "#F5B942",
          500: "#EBA321",
          600: "#C97F0E",
        },
        cyber: {
          cyan: "#6C4DF6",
          teal: "#0F9D8A",
          violet: "#A855F7",
          amber: "#D97706",
          rose: "#E11D48",
          lime: "#65A30D",
          blue: "#2563EB",
        },
        slate: {
          50: "#FCFBFE",
          100: "#140342",
          200: "#29204F",
          300: "#4B4766",
          400: "#6F6B85",
          500: "#8B88A3",
          600: "#A7A3B8",
          700: "#C9C5D8",
          800: "#DEDBEA",
          900: "#F0EDF7",
          950: "#F7F6FB",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        glow: "0 18px 45px -22px rgba(108, 77, 246, 0.55)",
        "glow-violet": "0 18px 45px -22px rgba(168, 85, 247, 0.5)",
        panel: "0 24px 60px -34px rgba(20, 3, 66, 0.28)",
        card: "0 18px 40px -30px rgba(20, 3, 66, 0.35)",
        float: "0 26px 60px -30px rgba(20, 3, 66, 0.45)",
      },
      backgroundImage: {
        "grid-light":
          "radial-gradient(circle at 1px 1px, rgba(108,77,246,0.10) 1px, transparent 0)",
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
          to: { strokeDashoffset: "-24" },
        },
        "flow-progress": {
          from: { transform: "translateX(-100%)" },
          to: { transform: "translateX(100%)" },
        },
      },
      animation: {
        float: "float 7s ease-in-out infinite",
        "pulse-ring": "pulse-ring 2.8s ease-out infinite",
        "slide-dash": "slide-dash 1.4s linear infinite",
        "flow-progress": "flow-progress 1.4s ease-in-out infinite",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
