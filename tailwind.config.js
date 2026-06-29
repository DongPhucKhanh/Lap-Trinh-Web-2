/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  corePlugins: {
    preflight: false, // Vô hiệu hóa reset CSS để không hỏng giao diện cũ
  },
  theme: {
    extend: {
      colors: {
        primary: "#ff6b6b",
        "primary-hover": "#ff5252",
        secondary: "#4ecdc4",
        dark: "#1a1a2e",
        "dark-light": "#16213e",
        light: "#f4f7f6",
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
