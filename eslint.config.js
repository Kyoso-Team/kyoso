import svelte from 'eslint-plugin-svelte';
import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import globals from 'globals';
import ts from 'typescript-eslint';

export default ts.config(
  js.configs.recommended,
  ...ts.configs.recommended,
  ...svelte.configs['flat/recommended'],
  prettier,
  ...svelte.configs['flat/prettier'],
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        Bun: false
      }
    }
  },
  {
    files: ['**/*.svelte'],

    languageOptions: {
      parserOptions: {
        parser: ts.parser
      }
    }
  },
  {
    ignores: ['frontend/build/', 'frontend/.svelte-kit/', 'frontend/dist', 'backend/dist']
  },
  {
    rules: {
      quotes: [
        'warn',
        'single',
        {
          avoidEscape: true
        }
      ],
      semi: ['warn', 'always'],
      'no-var': 'error',
      'brace-style': ['warn', '1tbs'],
      'comma-dangle': ['warn', 'never'],
      'default-case': 'error',
      'prefer-const': 'warn',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-inferrable-types': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      'quote-props': ['warn', 'as-needed'],
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_'
        }
      ],
      '@typescript-eslint/no-unsafe-declaration-merging': 'off',
      'svelte/no-at-html-tags': 'off'
      // 'drizzle/enforce-delete-with-where': [
      //   'error',
      //   {
      //     drizzleObjectName: 'db'
      //   }
      // ],
      // 'drizzle/enforce-update-with-where': [
      //   'error',
      //   {
      //     drizzleObjectName: 'db'
      //   }
      // ],
    }
  }
);
