/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./assets/**/*.js", "index.html"],
  theme: {
    extend: {
      colors: {
        primary: "var(--primary-color)",
        secondary: "var(--secondary-color)",
        tertinary: "var(--tertinary-color)",
        theme: "var(--theme-color)",
        body: "var(--body-color)",
        heading: "var(--heading-color)",
        paragraph: "var(--paragraph-color)",
        hover: "var(--hover-color)",
        focus: "var(--ring-color)",
      },
      fontFamily: {
        outfit: ['"Outfit"', "sans-serif"],
      },
      dropShadow: {
        "3xl": "var(--box-shadow-color)",
      },
      animation: {
        spin: "spin 2.5s linear infinite",
      },
    },
  },
  plugins: [],
};
