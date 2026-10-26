module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  settings: { react: { version: '18.2' } },
  plugins: ['react-refresh'],
  rules: {
    'react/jsx-no-target-blank': 'off',
    // The house convention is plain destructured props with no PropTypes
    // declarations anywhere in src/ — the rule only produces noise here.
    'react/prop-types': 'off',
    // The house pattern is a section file exporting its small helper pieces
    // beside the main component, plus `export default SectionWrapper(...)`
    // (an anonymous HOC this rule can never satisfy). It is a Vite
    // hot-reload-granularity advisory, not a code defect — and the gate runs
    // with --max-warnings 0. Off by convention; see Hero/About/Works.
    'react-refresh/only-export-components': 'off',
  },
  overrides: [
    {
      // react-three-fiber element props (args, attach, position, intensity…)
      // are real API, not DOM unknowns; the checker only knows HTML.
      files: ['src/components/canvas/**/*.{js,jsx}'],
      rules: { 'react/no-unknown-property': 'off' },
    },
  ],
}
