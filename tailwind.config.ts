import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // ─── Paleta Ananda ───────────────────────────────────
        ananda: {
          // Indigo profundo: sidebar, botones primarios, texto de marca
          950: '#1A0F3D',
          900: '#2D1B69',
          800: '#3D2882',
          700: '#4E369B',
          // Violeta: acentos, estados confirmados, links
          500: '#7C3AED',
          400: '#A78BFA',
          100: '#EDE9FE',
          50:  '#FAF5FF',
        },
        // Turquesa: ingresos, pagos aprobados
        teal: {
          600: '#0D9488',
          50:  '#F0FDFA',
        },
        // Coral: alertas, cancelaciones, pendientes urgentes
        coral: {
          600: '#E85D4A',
          50:  '#FFF1EF',
        },
        // Dorado: elementos premium, sesiones especiales
        gold: {
          500: '#D4A843',
          50:  '#FFFBEB',
        },
        // Fondo del CRM
        surface: '#FAF8FF',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-playfair)', 'Georgia', 'serif'], // solo títulos de tienda
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '20px',
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.05)',
        'card-hover': '0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
      },
    },
  },
  plugins: [],
}

export default config
