/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fdf8ee',
          100: '#f9edcf',
          200: '#f2d89b',
          300: '#eabd5e',
          400: '#e4a333',
          500: '#d4881a',
          600: '#be6a13',
          700: '#9b4e13',
          800: '#7e3e16',
          900: '#693416',
          950: '#3c1a08',
        },
        dark: {
          DEFAULT: '#0a0a0f',
          50: '#f5f5f7',
          100: '#ebebf0',
          200: '#d1d1db',
          300: '#a8a8b8',
          400: '#787890',
          500: '#5a5a72',
          600: '#484860',
          700: '#3a3a50',
          800: '#252535',
          900: '#17171f',
          950: '#0a0a0f',
        },
        gold: '#d4a842',
        cream: '#f5f0e8',
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        body: ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #0a0a0f 0%, #17171f 50%, #252535 100%)',
        'gold-gradient': 'linear-gradient(135deg, #d4a842 0%, #f0c866 50%, #d4a842 100%)',
        'card-gradient': 'linear-gradient(to bottom, transparent 50%, rgba(10,10,15,0.9) 100%)',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(212,168,66,0.3)',
        'glow-lg': '0 0 40px rgba(212,168,66,0.4)',
        'card': '0 4px 24px rgba(0,0,0,0.12)',
        'card-hover': '0 12px 40px rgba(0,0,0,0.2)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'shimmer': 'shimmer 2s infinite linear',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        float: { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
      },
    },
  },
  plugins: [],
}
