/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'cosmic-blue': '#7b81ec',
        'cosmic-purple': '#e082e6',
        'cosmic-bg': '#070a1a',
      }
    },
  },
  plugins: [],
}
