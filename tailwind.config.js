/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'ocean': {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        'primary': {
          DEFAULT: 'var(--color-primary)',
          light: 'var(--color-primary-light)',
          dark: 'var(--color-primary-dark)',
        },
        'app-background': 'var(--color-background)',
        'card': 'var(--color-card-background)',
        'app-text': {
          DEFAULT: 'var(--color-text)',
          secondary: 'var(--color-text-secondary)',
        },
        'app-border': 'var(--color-border)',
        'nav': {
          bg: 'var(--color-nav-background)',
          text: 'var(--color-nav-text)',
          active: 'var(--color-nav-text-active)',
        },
        'btn': {
          primary: 'var(--color-button-primary)',
          'primary-hover': 'var(--color-button-primary-hover)',
          text: 'var(--color-button-text)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      backgroundColor: {
        'app': 'var(--color-background)',
        'card': 'var(--color-card-background)',
        'nav': 'var(--color-nav-background)',
      },
      textColor: {
        'app': 'var(--color-text)',
        'app-secondary': 'var(--color-text-secondary)',
        'nav': 'var(--color-nav-text)',
        'nav-active': 'var(--color-nav-text-active)',
      },
      borderColor: {
        'app': 'var(--color-border)',
      },
    },
  },
  plugins: [],
} 