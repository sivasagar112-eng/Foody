// tailwind.config.js
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#E23744", // Foody Red
          dark: "#A8202A",
          light: "#FFEBEC",
        },
        secondary: {
          DEFAULT: "#2D3033", // Charcoal dark text
          light: "#686B6E",
        },
        accent: {
          DEFAULT: "#F4F6FB", // Soft light gray-blue background
          dark: "#E4E8F0",
        },
        veg: "#0F8A5F", // Green for Veg
        nonveg: "#C93B3B", // Red for Non-veg
      },
    },
  },
  plugins: [],
}
