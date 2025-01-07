import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';
import google from 'eslint-config-google';
import {dirname} from "path";
import {fileURLToPath} from "url";
import {FlatCompat} from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}']},
  {languageOptions: {globals: globals.browser}},
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  google,
  {
    rules: {
      'no-multiple-empty-lines': ['error', {'max': 1, 'maxEOF': 0}],
      'no-unused-vars': 0,
      'require-jsdoc': 'warn',
      'max-len': ['error', {'code': 120}],
    },
  },
  {
    'settings': {
      'react': {
        'version': 'detect',
      },
    },
  },
  {ignores: ['node_modules/', 'dist/', 'build/', '.next']},
];

export default eslintConfig;


