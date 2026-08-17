/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'archivo-black': ['"Archivo Black"', 'sans-serif'],
        'inter': ['Inter', 'sans-serif'],
        'manrope': ['Manrope', 'sans-serif'],
        'jetbrains': ['"JetBrains Mono"', 'monospace'],
      },
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
      },
      keyframes: {
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' }
        },
        'slide-out-right': {
          '0%': { transform: 'translateX(0)', opacity: '1' },
          '100%': { transform: 'translateX(100%)', opacity: '0' }
        }
      },
      animation: {
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'slide-out-right': 'slide-out-right 0.3s ease-in'
      }
    },
  },
  plugins: [],
}
