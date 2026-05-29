/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Outfit', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        '3xl': '24px',
        '4xl': '32px',
      },
      boxShadow: {
        'premium': '0 20px 40px -15px rgba(0, 0, 0, 0.03), 0 35px 60px -15px rgba(0, 0, 0, 0.05)',
        'premium-hover': '0 30px 60px -10px rgba(0, 0, 0, 0.06), 0 45px 80px -15px rgba(0, 0, 0, 0.08)',
        'card-glow': '0 0 25px 0 rgba(14, 165, 233, 0.04)',
      },
    },
  },
  plugins: [],
}
