import type { Config } from 'tailwindcss'

export default {
  content: [
    './app/components/**/*.{vue,js,ts}',
    './app/pages/**/*.vue',
    './app/app.vue',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eefaf5',
          100: '#d7f3e7',
          500: '#1f9d6a',
          600: '#16845a',
          700: '#116a49',
        },
        neutral: {
          0: '#ffffff',
          50: '#f8faf9',
          100: '#eef2f0',
          200: '#dde4e0',
          500: '#66736c',
          700: '#34423b',
          900: '#18211d',
        },
        warning: {
          500: '#f59e0b',
        },
        danger: {
          500: '#dc2626',
        },
        info: {
          500: '#2563eb',
        },
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '14px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(16, 24, 20, 0.08)',
      },
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
} satisfies Config
