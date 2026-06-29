import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  { ignores: ['**/dist/**', '**/node_modules/**', '**/.astro/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  // Plain JS/MJS build scripts run in Node and use Node globals.
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      globals: { process: 'readonly', console: 'readonly', URL: 'readonly' },
    },
  },
  prettier,
);
