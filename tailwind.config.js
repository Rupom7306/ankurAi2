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
        bg: {
          DEFAULT: '#0A1210',
        },
        card: {
          DEFAULT: '#111C17',
          elevated: '#16241E',
        },
        'border-green': 'rgba(74, 222, 128, 0.18)',
        'border-header': 'rgba(74, 222, 128, 0.18)',
        text: {
          primary: '#F1F6F3',
          secondary: '#B4C6BC',
          'on-accent': '#08110D',
        },
        accent: {
          DEFAULT: '#4ADE80',
          hover: '#6EE7A0',
          muted: 'rgba(74, 222, 128, 0.14)',
        },
        olive: {
          DEFAULT: '#A8B52A',
          soft: 'rgba(168, 181, 42, 0.35)',
          faint: 'rgba(168, 181, 42, 0.12)',
        },
        pill: {
          critical: {
            text: '#FCA5A5',
            bg: 'rgba(239, 68, 68, 0.18)',
            border: 'rgba(239, 68, 68, 0.35)',
          },
          caution: {
            text: '#FCD34D',
            bg: 'rgba(245, 158, 11, 0.18)',
            border: 'rgba(245, 158, 11, 0.35)',
          },
          good: {
            text: '#86EFAC',
            bg: 'rgba(74, 222, 128, 0.18)',
            border: 'rgba(74, 222, 128, 0.35)',
          },
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        bengali: ['"Hind Siliguri"', 'Inter', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '14px',
        sm: '8px',
        md: '12px',
        lg: '14px',
        xl: '14px',
        '2xl': '16px',
      },
      boxShadow: {
        glow: '0 0 18px rgba(74, 222, 128, 0.25)',
        'glow-sm': '0 0 10px rgba(74, 222, 128, 0.15)',
        'olive-glow': '0 0 0 1px #A8B52A, 0 0 22px rgba(168, 181, 42, 0.35)',
        'card-soft': '0 4px 24px -2px rgba(0, 0, 0, 0.45)',
      }
    },
  },
  plugins: [],
}
