// Configuración de Tailwind CSS: tema, colores y estilos personalizados
// Define utilidades de diseño responsivo de la aplicación
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"], // Assuming we use Inter for a premium feel
      },
    },
  },
  plugins: [],
};
