/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        nunito: ["Nunito-Regular", "san-serif"],
        "nunito-light": ["Nunito-Light", "san-serif"],
        "nunito-bold": ["Nunito-Bold", "san-serif"],
        "nunito-semibold": ["Nunito-SemiBold", "san-serif"],
        "nunito-medium": ["Nunito-Medium", "san-serif"],
      },
      colors: {
        "custom-top": "#20204C",
        "custom-bottom": "#14141E" 
      },
      backgroundImage: {
        "gradient-custom": "linear-gradient(to bottom, #20204C, #14141E)",
      },
    },
  },
  plugins: [],
};
