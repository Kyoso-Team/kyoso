import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,svelte}'],
  darkMode: 'selector',
  theme: {
    extend: {
      colors: {
        surface: {
          50: '#F5F4F5',
          100: '#E9E7E9',
          200: '#D1CCD1',
          300: '#B4ACB4',
          400: '#8F848F',
          500: '#433D43',
          600: '#3D383D',
          700: '#332E33',
          800: '#282428',
          900: '#1B181B',
          950: '#000000'
        },
        primary: {
          50: '#FEF6FA',
          100: '#FCE9F2',
          200: '#F9D2E4',
          300: '#F5B8D4',
          400: '#F098C1',
          500: '#EA6CA7',
          600: '#E65197',
          700: '#E0297E',
          800: '#B71A63',
          900: '#861349',
          950: '#5E0D33'
        }
      }
    }
  },
  plugins: [typography]
};
