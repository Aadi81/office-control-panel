// frontend/tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'capri-blue': '#00BFFF',
        'cobalt-blue': '#0047AB',
        'navy-blue': '#000080',
      },
    },
  },
  plugins: [],
}