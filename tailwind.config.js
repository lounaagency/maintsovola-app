/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./lib/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          500: '#4CAF50',
          600: '#388e3c',
          700: '#2e7d32',
        }
      },
      spacing: {
        '15': '60px',
        '30': '120px',
      }
    },
  },
  plugins: [],
  presets: [require("nativewind/preset")], 
}