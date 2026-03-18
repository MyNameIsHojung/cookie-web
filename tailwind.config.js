/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          plum: '#5A3F42',
          brown: '#705247',
          olive: '#7C6A4E',
          sage: '#7D8560',
          green: '#74A081',
          teal: '#67BAB1',
        },
      },
      fontFamily: {
        sans: ['"Pretendard"', '"Noto Sans KR"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
