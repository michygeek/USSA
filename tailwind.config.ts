import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#060e1f',
          900: '#0b1e3d',
          800: '#122a52',
        },
        gold: {
          400: '#d4b06a',
          500: '#c6a15b',
          600: '#b3893f',
        },
      },
    },
  },
  plugins: [],
};

export default config;
