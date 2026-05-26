/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'pastel-bg': '#c9dff0',
        'pastel-light': '#e0edf7',
        'pastel-accent': '#1a1a1a',
      }
    },
  },
  plugins: [],
}
