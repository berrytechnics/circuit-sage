/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fff8f1",
          100: "#ffe8d5",
          200: "#ffd4ad",
          300: "#ffba7a",
          400: "#ff9642",
          500: "#ff7a1a",
          600: "#ff6600",
          700: "#cc5200",
          800: "#a34200",
          900: "#7a3100",
          950: "#4c1d00",
        },
        white: "#ffffff",
        offwhite: "#f9f9f9",
        lightgray: "#f0f0f0",
        mediumgray: "#d1d1d1",
        darkgray: "#666666",
        dark: "#333333",
        black: "#111111",
        success: "#4ade80",
        warning: "#fbbf24",
        danger: "#ef4444",
        info: "#3b82f6",
        background: "rgb(var(--background-start-rgb))",
        foreground: "rgb(var(--foreground-rgb))",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "sans-serif"],
      },
      boxShadow: {
        soft: "0 2px 10px rgba(0, 0, 0, 0.05)",
        medium: "0 4px 20px rgba(0, 0, 0, 0.1)",
        hard: "0 8px 30px rgba(0, 0, 0, 0.15)",
      },
      borderRadius: {
        sm: "0.25rem",
        md: "0.375rem",
        lg: "0.5rem",
        xl: "1rem",
      },
    },
  },
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  plugins: [require("tailwindcss-animate")],
  safelist: [
    {
      pattern: /^(bg|text|border)-/,
    },
    {
      pattern: /^(rounded|p|m|flex|grid|gap|justify|items|w|h)-/,
    },
  ],
};
