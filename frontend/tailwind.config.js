// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // ← THIS LINE IS CRITICAL
  theme: {
    extend: {
      colors: {
        background: '#0f172a',
        surface: '#1e293b',
        text: '#f1f5f9',
        muted: '#94a3b8',
        primary: {
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
        },
      },
    },
  },
  plugins: [],
}