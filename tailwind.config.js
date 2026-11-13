/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#070B0A',
          900: '#0B100E',
          850: '#101614',
          800: '#141D1A',
          750: '#1A2521',
          700: '#202E29',
          600: '#2C3E37',
          500: '#3D544B',
        },
        parrot: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          300: '#86EFAC',
          400: '#4ADE80',
          500: '#16E05C', // Vibrant parrot green
          600: '#10B94E',
          700: '#0B8F3C',
          800: '#0D7032',
          900: '#0D5C2C',
          950: '#043416',
        },
        accent: {
          amber: '#F59E0B',
          cyan: '#06B6D4',
          crimson: '#EF4444',
          emerald: '#10B981',
        }
      },
      boxShadow: {
        'glow-sm': '0 0 12px rgba(22, 224, 92, 0.25)',
        'glow-md': '0 0 24px rgba(22, 224, 92, 0.35)',
        'glow-lg': '0 0 40px rgba(22, 224, 92, 0.45)',
        'glow-danger': '0 0 24px rgba(239, 68, 68, 0.4)',
        'glow-warning': '0 0 24px rgba(245, 158, 11, 0.4)',
        'inner-glow': 'inset 0 0 15px rgba(22, 224, 92, 0.15)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-pulse': 'glowPulse 2.5s ease-in-out infinite',
      },
      keyframes: {
        glowPulse: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.85' },
        }
      }
    },
  },
  plugins: [],
}
