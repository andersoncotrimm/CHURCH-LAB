import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1280px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        surface: "hsl(var(--surface))",
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
          // Escala pensada para fundo ESCURO: números baixos = tons
          // escuros/sutis (fundos de badge, item ativo do menu); números
          // altos = tons claros/vibrantes (texto sobre fundo escuro).
          // Vermelho vívido no tom Netflix (~#E50914), não rosa.
          50: "#280b0d",
          100: "#371012",
          200: "#521417",
          300: "#79151a",
          400: "#ae131b",
          500: "#d30d17",
          600: "#e60a15",
          700: "#f4343d",
          800: "#f47b81",
          900: "#f9c8ca",
        },
        cyan: {
          DEFAULT: "hsl(var(--cyan))",
          foreground: "hsl(var(--cyan-foreground))",
          // Dourado — acento secundário (tags de categoria), ecoa a cor
          // da estrelinha de avaliação da referência.
          50: "#2b2107",
          100: "#3d2f09",
          200: "#5c470d",
          300: "#8a6912",
          400: "#c2971a",
          500: "#e6b323",
          600: "#f7c73f",
          700: "#fad978",
          800: "#fce9ad",
          900: "#fef8e0",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        danger: {
          DEFAULT: "hsl(var(--danger))",
          foreground: "hsl(var(--danger-foreground))",
        },
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        subtle: "0 1px 2px 0 rgb(0 0 0 / 0.25)",
        card: "0 1px 3px 0 rgb(0 0 0 / 0.35), 0 1px 2px -1px rgb(0 0 0 / 0.3)",
        elevated:
          "0 4px 20px -4px rgb(0 0 0 / 0.45), 0 2px 8px -2px rgb(0 0 0 / 0.35)",
        floating:
          "0 24px 48px -12px rgb(0 0 0 / 0.55), 0 6px 16px -4px rgb(0 0 0 / 0.4)",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.97)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.4s ease-out",
        "scale-in": "scale-in 0.15s ease-out",
        shimmer: "shimmer 1.6s infinite",
      },
    },
  },
  plugins: [],
};

export default config;
