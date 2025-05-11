/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}" // tambahkan ini kalau pakai folder app
  ],
  theme: {
    extend: {
      screens: {
        'xs': '480px', // untuk perangkat hp kecil
      },
      colors: {
        primary: '#16a34a', // warna utama GERCAB
        glass: 'rgba(255, 255, 255, 0.8)',
      },
      boxShadow: {
        soft: '0 0 20px rgba(0, 0, 0, 0.05)',
      },
      borderRadius: {
        xl: '1rem',
      }
    },
  },
  plugins: [],
}
