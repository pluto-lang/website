/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx,md}",
    "./components/**/*.{js,ts,jsx,tsx,mdx,md}",
  ],
  theme: {
    extend: {
      lineClamp: {
        4: "4",
        3: "3",
      },
    },
  },
  plugins: [],
};
