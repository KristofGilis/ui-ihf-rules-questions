/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#0ea5e9',
          dark: '#06b6d4',
        },
        secondary: {
          light: '#3b82f6',
          dark: '#f97316',
        },
      },
    },
  },
  plugins: [],
}
