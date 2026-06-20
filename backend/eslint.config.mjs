export default [
  {
    files: ['src/**/*.ts', 'test/**/*.ts'],
    languageOptions: {
      parserOptions: { project: './tsconfig.json' }
    },
    rules: {
      'no-console': 'warn'
    }
  }
];
