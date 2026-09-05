/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          purple: '#714B67',
          'purple-light': '#F3EAF0',
          'purple-dark': '#583850',
          teal: '#017E84',
          'teal-light': '#E6F4F4',
          gray: '#8F8F8F',
          dark: '#2F2F2F',
          muted: '#6B7280',
          lightBg: '#F8F9FA',
          border: '#E5E7EB',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
