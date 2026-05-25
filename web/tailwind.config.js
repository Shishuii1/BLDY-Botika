/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#10B981',
        secondary: '#2563EB',
        dark: '#111827',
        gray: '#6B7280',
      },
    },
  },
  plugins: [],
};
