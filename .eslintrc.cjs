module.exports = {
  root: true,
  env: {
    es2024: true,
    node: true,
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    quotes: ['error', 'single'],
    semi: ['error', 'always'],
  },
  overrides: [
    {
      files: ['**/*.jsx', '**/*.tsx'],
      env: {
        browser: true,
        es2024: true,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      plugins: ['react', 'react-hooks'],
      extends: ['plugin:react/recommended', 'plugin:react-hooks/recommended'],
      settings: {
        react: {
          version: 'detect',
        },
      },
      rules: {
        'react/react-in-jsx-scope': 'off',
      },
    },
  ],
};
