/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'deep-navy': '#0A2F2F',
        'dark-teal': '#0D4D4D',
        'teal': '#14b8a6',
        'emerald': '#10b981',
        'cyan': '#06b6d4',
        'green': '#10b981',
        'text-primary': '#FFFFFF',
        'text-secondary': '#9CA3AF',
        'text-muted': '#6B7280',
      },
      backgroundImage: {
        'main-gradient': 'linear-gradient(135deg, #0A2F2F 0%, #0D4D4D 100%)',
        'card-gradient': 'linear-gradient(135deg, #0D4D4D, #14b8a6)',
        'button-gradient': 'linear-gradient(135deg, #14b8a6, #10b981)',
        'active-gradient': 'linear-gradient(135deg, #10b981, #06b6d4)',
      }
    },
  },
  plugins: [],
}
