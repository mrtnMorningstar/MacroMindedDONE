import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--color-bg)",
        foreground: "var(--color-text)",
        card: "var(--color-card)",
        primary: {
          DEFAULT: "var(--color-accent)",
          foreground: "var(--color-text)",
        },
        secondary: {
          DEFAULT: "#111111",
          foreground: "var(--color-text)",
        },
        accent: {
          DEFAULT: "var(--color-accent)",
          dark: "var(--color-accent-dark)",
          foreground: "var(--color-text)",
        },
        destructive: {
          DEFAULT: "var(--color-accent)",
          foreground: "var(--color-text)",
        },
        muted: {
          DEFAULT: "#111111",
          foreground: "#888888",
        },
        border: "var(--color-border)",
        input: "var(--color-border)",
        ring: "var(--color-accent)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.5s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "gradient-move": "moveGradient 15s ease-in-out infinite alternate",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        moveGradient: {
          "0%": { backgroundPosition: "0% 0%" },
          "100%": { backgroundPosition: "100% 100%" },
        },
      },
      boxShadow: {
        "macro-glow": "0 0 20px rgba(255, 46, 46, 0.3)",
        "macro-glow-lg": "0 0 30px rgba(255, 46, 46, 0.4)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;

