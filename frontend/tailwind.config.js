import typography from '@tailwindcss/typography';
import plugin from 'tailwindcss/plugin';

function values(values) {
  return {
    values: values.reduce((obj, value) => ({ ...obj, [value]: value }), {})
  };
}

const tokens = values(
  [
    '950-50',
    '900-100',
    '800-200',
    '700-300',
    '600-400',
    '400-600',
    '300-700',
    '200-800',
    '100-900',
    '50-950'
  ]
    .map((value) => [
      ...['/5', '/10', '/20', '/30', '/40', '/50', '/60', '/70', '/80', '/90', '/95', '/100'].map(
        (suffix) => `${value}${suffix}`
      ),
      value
    ])
    .flat(1)
);

const customStyles = plugin(({ matchUtilities, addComponents, addUtilities }) => {
  matchUtilities(
    {
      'bg-surface-token': (value) => {
        const shades = value.split('/')[0].split('-');
        const opacity = value.split('/')[1] ? `/${value.split('/')[1]}` : '';
        return {
          [`@apply dark:bg-surface-${shades[0]}${opacity} bg-surface-${shades[1]}${opacity}`]: {}
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

  matchUtilities(
    {
      'text-surface-token': (value) => {
        const shades = value.split('/')[0].split('-');
        const opacity = value.split('/')[1] ? `/${value.split('/')[1]}` : '';
        return {
          [`@apply dark:text-surface-${shades[0]}${opacity} text-surface-${shades[1]}${opacity}`]:
            {}
        };
      }
    },
    tokens
  );

  matchUtilities(
    {
      'text-primary-token': (value) => {
        const shades = value.split('/')[0].split('-');
        const opacity = value.split('/')[1] ? `/${value.split('/')[1]}` : '';
        return {
          [`@apply dark:text-primary-${shades[0]}${opacity} text-primary-${shades[1]}${opacity}`]:
            {}
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
    '.btn-sm': {
      '@apply block px-3 py-1 text-sm leading-normal duration-150 font-medium rounded-md disabled:opacity-50':
        {}
    },
    '.btn-sm-surface-soft': {
      '@apply btn-sm bg-surface-token-700-300 hover:bg-surface-token-600-400 border-surface-token-600-400 border':
        {}
    },
    '.btn-sm-contrast': {
      '@apply btn-sm bg-black dark:bg-white hover:bg-surface-token-100-900 dark:text-black text-white':
        {}
    },

    '.btn-icon-sm': {
      '@apply block p-2 text-sm duration-150 rounded-md disabled:opacity-50': {}
    },
    '.btn-icon-sm-surface-soft': {
      '@apply btn-icon-sm bg-surface-token-700-300 hover:bg-surface-token-600-400 border-surface-token-600-400 border':
        {}
    },
    '.btn-icon-sm-contrast': {
      '@apply btn-icon-sm bg-black dark:bg-white hover:bg-surface-token-100-900 dark:text-black text-white':
        {}
    },

    '.btn-md': {
      '@apply block px-4 py-[6px] text-sm leading-normal duration-150 font-medium rounded-md': {}
    },
    '.btn-md-avatar': {
      '@apply w-[34.6px] h-[34.6px] border-2 dark:border-white border-black rounded-full overflow-hidden duration-150 hover:opacity-90':
        {}
    },
    '.btn-md-surface-soft': {
      '@apply btn-md bg-surface-token-700-300 hover:bg-surface-token-600-400 border-surface-token-600-400 border':
        {}
    },
    '.btn-md-ghost': {
      '@apply btn-md bg-transparent hover:bg-primary-500/25 border-transparent border': {}
    },
    '.btn-md-contrast': {
      '@apply btn-md border bg-black border-black dark:bg-white dark:border-white hover:border-surface-token-100-900 hover:bg-surface-token-100-900 dark:text-black text-white':
        {}
    },

    '.label': {
      '@apply has-[:disabled]:opacity-50 duration-150 [&>legend]:text-sm [&>legend]:text-surface-token-200-800 [&>legend]:duration-150 [&>legend>span]:text-red-500 [&>legend>span]:duration-150 [&>.error]:block [&>.error]:text-red-500 [&>.error]:text-sm [&>.error]:mt-[2px] [&>.error]:duration-150 [&>.description]:block [&>.description]:text-xs [&>.description]:mt-[2px] [&>.description]:text-surface-token-400-600 [&>.description]:duration-150':
        {}
    },
    '.input': {
      '@apply w-full rounded-md bg-surface-token-700-300 border border-surface-token-600-400 px-2 py-1 mt-1 text-black dark:text-white duration-150 disabled:cursor-not-allowed':
        {}
    },
    '.input-select': {
      '@apply input px-2 py-[6.4px]': {}
    },
    '.input-checkbox': {
      '@apply w-5 h-5 flex justify-center items-center rounded-md bg-surface-token-700-300 border border-surface-token-600-400 aria-checked:bg-primary-500 aria-checked:border-primary-token-400-600 duration-75':
        {}
    },
    '.input-error': {
      '@apply dark:border-red-500/50 duration-150': {}
    },
    '.input-preview': {
      '@apply block text-xs text-surface-token-200-800 mt-[2px] duration-150': {}
    },
    '.input-preview-error': {
      '@apply block text-xs dark:text-red-300 text-red-700 mt-[2px] duration-150': {}
    },

    '.line': {
      '@apply w-full h-[1px] bg-surface-token-600-400': {}
    },

    'h2': {
      '@apply text-2xl font-bold text-surface-token-100-900 dark:text-white text-black': {}
    },

    '.from-markdown-content': {
      '@apply prose prose-neutral dark:prose-invert': {}
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
  plugins: [typography, customStyles]
};
