/** @type {import('tailwindcss').Config} */
module.exports = {
  important: true,
  future: {
    hoverOnlyWhenSupported: true,
  },
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        homePage: 'url("/images/Scrollswap_bg.jpg")',
      },
      keyframes: {
        titleAnim: {
          "0%": {
            bottom: "-100px",
            opacity: "0",
          },
          "100%": {
            bottom: "0",
            opacity: "1",
          },
        },
      },
      animation: {
        titleAnim: "titleAnim 1s ease 1 forwards",
        fadeIn: "fadeIn 1s ease-out",
      },
      spacing: {
        8: "5rem",
        28: "4rem",
        44: "4rem",
      },
    },
  },
  plugins: [],
};
