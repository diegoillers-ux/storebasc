import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ananda: {
          950: '#1A0F3D',
          900: '#2D1B69',
          800: '#3D2882',
          700: '#4E369B',
          500: '#7C3AED',
          400: '#A78BFA',
          100: '#EDE9FE',
          50:  '#FAF5FF',
        },
        teal: {
          600: '#0D9488',
          50:  '#F0FDFA',
        },
        coral: {
          600: '#E85D4A',
          50:  '#FFF1EF',
        },
        gold: {
          500: '#D4A843',
          50:  '#FFFBEB',
        },
        surface: '#FAF8FF',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-playfair)', 'Georgia', 'serif'],
      },
      borderRadius: {
        '3xl': '24px',
        '2xl': '16px',
        'xl': '12px',
      },
      boxShadow: {
        premium: '0 10px 30px -15px rgba(26, 15, 61, 0.05), 0 4px 12px -4px rgba(26, 15, 61, 0.02)',
        'premium-hover': '0 20px 40px -20px rgba(26, 15, 61, 0.1), 0 8px 20px -6px rgba(26, 15, 61, 0.04)',
      },
    },
  },
  plugins: [],
};

export default config;
