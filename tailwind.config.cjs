/** @type {import(tailwindcss).Config} */
module.exports = {
  content: [
    "./src/**/*.{tsx,ts,jsx,js}",
    "./index.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#B91C1C",
          dark: "#991B1B",
          light: "#DC2626",
          50: "#FEF2F2",
          100: "#FEE2E2",
          200: "#FECACA",
          300: "#FCA5A5",
          400: "#F87171",
          500: "#EF4444",
          600: "#DC2626",
          700: "#B91C1C",
          800: "#991B1B",
          900: "#7F1D1D",
        },
        accent: {
          DEFAULT: "#D4A017",
          dark: "#B8860B",
          light: "#F59E0B",
        },
        secondary: {
          DEFAULT: "#D4A017",
          dark: "#B8860B",
          light: "#F59E0B",
        },
      },
    },
  },
  plugins: [],
};
