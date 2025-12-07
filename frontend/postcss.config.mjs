// postcss.config.mjs
const config = {
  plugins: {
    '@tailwindcss/postcss7-compat': {},  // Correct plugin
    autoprefixer: {},  // Add autoprefixer for better compatibility
  },
};

export default config;
