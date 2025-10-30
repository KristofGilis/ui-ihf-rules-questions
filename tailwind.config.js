/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // IHF Official Brand Colors
        // Primary: IHF Blue (royal blue from their logo)
        'ihf-blue': {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93bbfd',
          400: '#6097fa',
          500: '#3b73f6',  // Main IHF blue
          600: '#2557eb',
          700: '#1d44d8',
          800: '#1e38af',
          900: '#1e338a',
        },
        // Secondary: IHF Gold/Yellow (from their logo)
        'ihf-gold': {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',  // Main IHF gold
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        // Accent: IHF Red (often used in handball contexts)
        'ihf-red': {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',  // Main IHF red
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
      },
    },
  },
  plugins: [],
}
