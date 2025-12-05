/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Example: 'Press Start 2P' or a more modern game font
        // Need to import this font in index.css
        game: ['"Press Start 2P"', 'cursive'], // Placeholder - replace with a suitable font
        sans: ['Inter', 'sans-serif'], // Keep a modern sans-serif for general text
      },
    },
  },
  plugins: [],
}
