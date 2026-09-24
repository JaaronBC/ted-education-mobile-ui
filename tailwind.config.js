/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],

  presets: [require('nativewind/preset')],

  theme: {
    extend: {
      colors: {
        ted: {
          blue: '#618FA7',
          dark: '#3F6F86',
          tan: '#CFB990',
          cream: '#F4F3EF',
          text: '#202020',
          muted: '#707070',
        },
      },
    },
  },

  plugins: [],
};