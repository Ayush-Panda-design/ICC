/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          bg: '#FFF8F0',
          card: '#FFFBF5',
          dark: '#F5EDE0',
        },
        accent: {
          red: '#E63946',
          'red-soft': '#FFE5E7',
          yellow: '#F4A261',
          'yellow-soft': '#FFF3E0',
          green: '#2A9D8F',
          'green-soft': '#E8F5F0',
        },
        text: {
          primary: '#1A1A2E',
          muted: '#6B7280',
        },
        border: '#E8DFD0',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(26, 26, 46, 0.05)',
      }
    },
  },
  plugins: [],
}
