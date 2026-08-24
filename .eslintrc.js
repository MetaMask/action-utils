module.exports = {
  root: true,

  extends: ['@metamask/eslint-config'],

  rules: {
    // Handled by Oxfmt.
    'prettier/prettier': 'off',
    'import/order': 'off',
  },

  overrides: [
    {
      files: ['*.ts'],
      extends: ['@metamask/eslint-config-typescript'],
      rules: {
        'no-shadow': 'off',
        '@typescript-eslint/no-shadow': ['error', { builtinGlobals: true }],
      },
    },

    {
      files: ['*.js'],
      parserOptions: {
        sourceType: 'script',
      },
      extends: ['@metamask/eslint-config-nodejs'],
    },

    {
      files: ['*.test.ts', '*.test.js'],
      extends: ['@metamask/eslint-config-jest'],
      rules: {
        'import/unambiguous': 'off',
      },
    },
  ],

  ignorePatterns: ['!.eslintrc.js', '!.prettierrc.js', 'dist/'],
};
