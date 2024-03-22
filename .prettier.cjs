/** @type {import('prettier').Config} */
module.exports = {
  plugins: ["prettier-plugin-organize-imports", "prettier-plugin-tailwindcss"],
  organizeImportsSkipDestructiveCodeActions: true,
  arrowParens: "avoid",
  bracketSameLine: true,
  bracketSpacing: true,
  singleQuote: false,
  trailingComma: "none",
  tabWidth: 2,
  useTabs: false,
  semi: true,
  printWidth: 500,
};
