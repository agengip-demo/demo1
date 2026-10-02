import { defineConfig } from 'eslint/config';
import eslint from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig(
  { ignores: ['dist/', 'coverage/', 'playwright-report/', 'test-results/', 'infra/', '.aep-governance/'] },
  eslint.configs.recommended,
  tseslint.configs.recommended,
  { languageOptions: { globals: globals.node } },
);
