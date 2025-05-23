/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  // Mode important pour éviter les conflits avec Bootstrap
  important: true,
  theme: {
    extend: {},
  },
  // Préfixer toutes les classes Tailwind pour éviter les conflits
  prefix: 'tw-',
  corePlugins: {
    preflight: false, // Désactive les styles de base de Tailwind pour éviter de réinitialiser Bootstrap
  },
  plugins: [],
}