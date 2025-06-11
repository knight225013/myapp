import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';
import pluginPrettier from 'eslint-plugin-prettier';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  // JavaScript recommended rules
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    plugins: { js },
    extends: ['js/recommended'],
  },
  // CommonJS support for .js files
  {
    files: ['**/*.js'],
    languageOptions: { sourceType: 'commonjs' },
  },
  // Browser globals
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    languageOptions: { globals: globals.browser },
  },
  // TypeScript recommended rules
  tseslint.configs.recommended,
  // React recommended rules
  pluginReact.configs.flat.recommended,
  // Prettier integration: run Prettier as an ESLint rule
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx,json,css,md}'],
    plugins: { prettier: pluginPrettier },
    rules: { 'prettier/prettier': 'error' },
  },
]);
