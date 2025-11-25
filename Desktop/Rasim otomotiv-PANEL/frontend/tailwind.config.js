/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4FD1C5',
          50: '#E6FAF8',
          100: '#CCF5F1',
          200: '#99EBE3',
          300: '#66E1D5',
          400: '#4FD1C5',
          500: '#3BBFB3',
          600: '#2E9A8F',
          700: '#22746B',
          800: '#164E47',
          900: '#0A2823',
        },
        secondary: {
          DEFAULT: '#3B82F6',
          50: '#EBF2FE',
          100: '#D7E5FD',
          200: '#AFCBFB',
          300: '#87B1F9',
          400: '#5F97F7',
          500: '#3B82F6',
          600: '#1C64F2',
          700: '#0D4FD6',
          800: '#0A3A9F',
          900: '#072668',
        },
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
      },
    },
  },
  plugins: [],
}
