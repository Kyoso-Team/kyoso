import plugin from 'tailwindcss/plugin';

function values(values) {
  return {
    values: values.reduce((obj, value) => ({ ...obj, [value]: value }), {})
  };
}

const tokens = values(
  ['950-50', '900-100', '800-200', '700-300', '600-400', '400-600', '300-700', '200-800', '100-900', '50-950']
    .map((value) => [
      ...['/5', '/10', '/20', '/30', '/40', '/50', '/60', '/70', '/80', '/90', '/95', '/100'].map((suffix) => `${value}${suffix}`),
      value
    ])
    .flat(1)
);

const customStyles = plugin(({ matchUtilities, addComponents, addUtilities }) => {
  matchUtilities(
    {
      'bg-surface-token': (value) => {
        const split = value.split('-');
        return {
          [`@apply dark:bg-surface-${split[0]} bg-surface-${split[1]}`]: {}
        };
      }
    },
    tokens
  );

  matchUtilities(
    {
      'bg-primary-token': (value) => {
        const shades = value.split('/')[0].split('-');
        const opacity = value.split('/')[1] ? `/${value.split('/')[1]}` : '';
        return {
          [`@apply dark:bg-primary-${shades[0]}${opacity} bg-primary-${shades[1]}${opacity}`]: {}
        };
      }
    },
    tokens
  );

  matchUtilities(
    {
      'border-surface-token': (value) => {
        const split = value.split('-');
        return {
          [`@apply dark:border-surface-${split[0]} border-surface-${split[1]}`]: {}
        };
      }
    },
    tokens
  );

  matchUtilities(
    {
      'border-primary-token': (value) => {
        const split = value.split('-');
        return {
          [`@apply dark:border-primary-${split[0]} border-primary-${split[1]}`]: {}
        };
      }
    },
    tokens
  );

  addUtilities({
    '.p-content': {
      '@apply px-20': {}
    }
  });

  addComponents({
    '.btn': {
      '@apply block px-2 py-[2px] text-sm leading-normal duration-150 font-medium rounded-md': {}
    },
    '.btn-surface-soft': {
      '@apply btn bg-surface-token-700-300 hover:bg-surface-token-600-400 border-surface-token-600-400 border': {}
    },

    '.btn-md': {
      '@apply block px-4 py-1 text-sm leading-normal duration-150 font-medium rounded-md': {}
    },
    '.btn-md-surface-soft': {
      '@apply btn-md bg-surface-token-700-300 hover:bg-surface-token-600-400 border-surface-token-600-400 border': {}
    },
    '.btn-md-ghost': {
      '@apply btn-md bg-transparent hover:bg-primary-500/25 border-transparent border': {}
    },
    '.btn-md-contrast': {
      '@apply btn-md bg-black dark:bg-white hover:bg-surface-token-100-900 dark:text-black text-white': {}
    }
  });
});

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
  plugins: [customStyles]
};
