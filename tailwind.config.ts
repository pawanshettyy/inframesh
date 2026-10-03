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
        apple: {
          canvas: "#000000",
          surface: "#0a0a0a",
          card: "rgba(24, 27, 32, 0.75)",
          cardHover: "rgba(32, 36, 44, 0.85)",
          glass: "rgba(255, 255, 255, 0.05)",
          glassBorder: "rgba(255, 255, 255, 0.08)",
          glassHover: "rgba(255, 255, 255, 0.09)",
          glassSpecular: "rgba(255, 255, 255, 0.15)",
          textPrimary: "#ededed",
          textSecondary: "#a1a1a1",
          textTertiary: "#666666",
          textMuted: "#444444",
          borderSubtle: "rgba(255, 255, 255, 0.07)",
          borderMedium: "rgba(255, 255, 255, 0.12)",
          accent: "#369eff", // Apple system blue
          accentMuted: "rgba(41, 151, 255, 0.15)",
          intelligence: "#7774ff", // Subtle AI neural tint
          success: "#3ecf6d", // Apple system green
          warning: "#f5a623", // Apple system yellow
          degraded: "#f5a623", // Apple system orange
          critical: "#ff5b52", // Apple system red
        }
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "system-ui",
          "sans-serif"
        ],
        mono: [
          '"DM Mono"',
          '"SF Mono"',
          '"Menlo"',
          '"Monaco"',
          '"Courier New"',
          "monospace"
        ]
      },
      boxShadow: {
        'apple-window': '0 30px 60px -12px rgba(0, 0, 0, 0.65), 0 18px 36px -18px rgba(0, 0, 0, 0.6)',
        'apple-card': '0 4px 20px -2px rgba(0, 0, 0, 0.35), 0 0 1px 1px rgba(255, 255, 255, 0.06) inset',
        'apple-popover': '0 20px 40px -8px rgba(0, 0, 0, 0.7), 0 0 1px 1px rgba(255, 255, 255, 0.12) inset',
        'glass-glow': '0 0 30px -5px rgba(41, 151, 255, 0.15)',
        'ai-glow': '0 0 25px -4px rgba(99, 102, 241, 0.25), 0 0 1px 1px rgba(99, 102, 241, 0.3) inset',
        'critical-glow': '0 0 20px -4px rgba(255, 69, 58, 0.35), 0 0 1px 1px rgba(255, 69, 58, 0.3) inset',
      },
      backdropBlur: {
        'xs': '2px',
        'macos': '28px',
        'spatial': '40px',
      }
    },
  },
  plugins: [],
};

export default config;