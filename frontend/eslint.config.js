import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', 'dist-demo', 'dist-demo-backend', 'coverage', 'design', 'node_modules', 'docs'] },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: { ecmaVersion: 2023, globals: globals.browser },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', ignoreRestSiblings: true },
      ],
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                'react',
                'react-dom',
                '**/api/**',
                '**/data/**',
                '**/komponen/**',
                '**/penyedia/**',
              ],
              message: 'src/lib hanya berisi fungsi murni (aturan-proyek.md bagian 3).',
            },
          ],
        },
      ],
    },
  },
  {
    // Aturan impor terlarang hanya berlaku untuk src/lib.
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/lib/**'],
    rules: { 'no-restricted-imports': 'off' },
  },
  {
    // D-20: halaman dan komponen hanya memakai klien API lewat hook src/api/kueri, tidak pernah
    // data atau implementasi tiruan, penyedia, atau fetch langsung (T3.12).
    files: ['src/halaman/**/*.{ts,tsx}', 'src/komponen/**/*.{ts,tsx}'],
    ignores: ['**/*.test.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '**/api/tiruan/**',
                '**/api/sumber',
                '**/penyedia/**',
                '@data-contoh/**',
                '**/shared/data-contoh/**',
              ],
              message:
                'Halaman dan komponen hanya mengambil data lewat hook di src/api/kueri (keputusan D-20).',
            },
          ],
        },
      ],
      'no-restricted-globals': [
        'error',
        {
          name: 'fetch',
          message: 'Ambil data lewat klien API (src/api/kueri), bukan fetch langsung (D-20).',
        },
      ],
    },
  },
  {
    files: ['vite.config.ts', 'tailwind.config.ts'],
    rules: { 'no-restricted-imports': 'off' },
  },
  {
    files: ['scripts/**/*.mjs', '*.js'],
    languageOptions: { globals: globals.node },
    extends: [js.configs.recommended],
  },
);
