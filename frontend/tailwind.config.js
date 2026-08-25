/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta minimalista: neutros cálidos + un único acento apagado.
        // Se sobreescribe la escala "rose" de Tailwind para no tener que
        // tocar cada componente que ya usa clases como bg-rose-600.
        rose: {
          50: '#F5F5F4',
          100: '#E7E5E4',
          600: '#18181B', // acento principal: negro casi puro
        },
        gold: { 500: '#71717A' }, // acento secundario neutro (paso completado)
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        body: ['"Inter"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
