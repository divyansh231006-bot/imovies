/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        imovies: {
          darkest: '#080B11',
          dark: '#0F172A',
          charcoal: '#1E293B',
          card: '#161F30',
          red: '#E50914',
          redHover: '#F40612',
          redGlow: 'rgba(229, 9, 20, 0.35)',
          gold: '#F59E0B',
          silver: '#94A3B8',
          platinum: '#38BDF8',
          vip: '#A855F7'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif']
      },
      boxShadow: {
        'cinema': '0 10px 30px -10px rgba(0, 0, 0, 0.7)',
        'red-glow': '0 0 25px rgba(229, 9, 20, 0.45)',
        'card-glow': '0 4px 20px rgba(0, 0, 0, 0.4)'
      }
    },
  },
  plugins: [],
}
