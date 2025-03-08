export default [
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
    },
    rules: {
      semi: "error",
      quotes: ["error", "double"],
    },
  },
];