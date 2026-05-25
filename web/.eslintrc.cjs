module.exports = {
  env: {
    browser: true,
    es2024: true,
  },
  globals: {
    window: 'readonly',
    document: 'readonly',
    localStorage: 'readonly',
  },
  overrides: [
    {
      files: ['**/__tests__/**', '**/*.test.{js,jsx}'],
      env: { jest: true },
    },
    {
      files: ['**/*.jsx', '**/*.js'],
      rules: {
        'react/prop-types': 'off',
      },
    },
  ],
};
