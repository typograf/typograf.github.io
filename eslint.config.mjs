import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';

export default [
  {
    ignores: [
      '.*',
      'build/**',
      'node_modules/**',
      'dist/**',
      'postcss.config.js'
    ]
  },
  {
    files: ['**/*.{js,mjs,cjs,ts}']
  },
  {
    languageOptions: { globals: {
      ...globals.browser,
      ...globals.node
    }}
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
];
