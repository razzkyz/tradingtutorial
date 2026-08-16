/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'deep-navy': '#061923',
        'dark-teal': '#063B4C',
        'teal': '#087E8B',
        'emerald': '#16A085',
        'cyan': '#20C9D8',
        'green': '#22C55E',
        'text-primary': '#FFFFFF',
        'text-secondary': '#A7BBC4',
        'text-muted': '#6F8791',
      },
      backgroundImage: {
        'main-gradient': 'linear-gradient(135deg, #061923 0%, #073B4C 45%, #075F65 100%)',
        'card-gradient': 'linear-gradient(135deg, #063B4C, #087E8B)',
        'button-gradient': 'linear-gradient(135deg, #087E8B, #20C9D8)',
        'active-gradient': 'linear-gradient(135deg, #16A085, #22C55E)',
      }
    },
  },
  plugins: [],
}
