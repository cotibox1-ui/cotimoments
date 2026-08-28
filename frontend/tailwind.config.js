/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta premium: rosa elegante (no infantil) + gris cálido para
        // texto. Se sobreescribe la escala "rose" de Tailwind completa,
        // así todo el código que ya usa bg-rose-600, text-rose-600, etc.
        // hereda el look nuevo sin tener que tocar cada archivo.
        rose: {
          25: '#FFFBFC',
          50: '#FDF2F6',
          100: '#FCE7EF',
          200: '#F9CEE0',
          300: '#F4A8C6',
          400: '#EC72A3',
          500: '#DE447F',
          600: '#C42A63', // acento principal: rosa intenso, elegante
          700: '#A31E4F',
          900: '#5C1030',
        },
        gold: { 500: '#D4A574' }, // acento secundario cálido (paso completado)
        ink: { 900: '#2B2330', 600: '#6B6470', 400: '#A39CAA' }, // grises cálidos para texto
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        body: ['"Inter"', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 2px 12px -2px rgba(196, 42, 99, 0.08)',
        card: '0 1px 3px rgba(43, 35, 48, 0.06), 0 1px 2px rgba(43, 35, 48, 0.04)',
      },
    },
  },
  plugins: [],
};
