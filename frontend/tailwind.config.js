// tailwind.config.js

module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",   // Ensure this points to your app folder
    "./components/**/*.{js,ts,jsx,tsx}",  // If you have a components folder
  ],
  theme: {
    extend: {
      // You can add custom theme configurations here
    },
  },
  plugins: [
    // Add any Tailwind plugins you want to use here (e.g., typography, forms, etc.)
  ],
};
