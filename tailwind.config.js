/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    ./src/**/*.tsx,
    ./index.html
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#9333EA',  // Purple
          dark: '#7C3AED',
          light: '#A855F7'
        },
        secondary: {
          DEFAULT: '#EC4899',  // Pink
          dark: '#DB2777',
          light: '#F472B6'
        },
        accent: {
          DEFAULT: '#1E3A8A',  // Deep Blue
          dark: '#1E40AF',
          light: '#3B82F6'
        }
      }
    },
  },
  plugins: [],
}
