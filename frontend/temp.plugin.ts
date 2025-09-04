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

  addUtilities({
    '.content-wrapper': {
      '@apply flex justify-center items-center': {}
    },
    '.content': {
      '@apply w-full max-w-5xl': {}
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
      '@apply has-disabled:opacity-50 duration-150 [&>legend]:text-sm [&>legend]:text-surface-token-200-800 [&>legend]:duration-150 [&>legend>span]:text-red-500 [&>legend>span]:duration-150 [&>.error]:block [&>.error]:text-red-500 [&>.error]:text-sm [&>.error]:mt-[2px] [&>.error]:duration-150 [&>.description]:block [&>.description]:text-xs [&>.description]:mt-[2px] [&>.description]:text-surface-token-400-600 [&>.description]:duration-150':
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
      '@apply w-full h-px bg-surface-token-600-400': {}
    },

    '.from-markdown-content': {
      '@apply prose prose-neutral dark:prose-invert': {}
    },

    '.card': {
      '@apply rounded-md border border-surface-token-600-400 bg-surface-token-800-200 flex flex-col text-left overflow-hidden text-sm': {}
    },
    '.card-title': {
      '@apply font-semibold text-xl': {}
    },
    '.card-body': {
      '@apply p-6': {}
    },
    '.card-form': {
      '@apply grid gap-4': {}
    },
    '.card-footer': {
      '@apply bg-surface-token-900-100 px-6 py-3 flex': {}
    },
    '.card-footer-body': {
      '@apply flex items-center min-w-max': {}
    },
    '.card-btns': {
      '@apply flex justify-end w-full gap-2': {}
    }
  });
});