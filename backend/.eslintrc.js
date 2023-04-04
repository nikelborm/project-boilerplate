module.exports = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "./tsconfig.json",
    tsconfigRootDir: __dirname,
    sourceType: "module",
  },
  plugins: ["@typescript-eslint/eslint-plugin", "nestjs", "import", "prettier", "security", "@microsoft/eslint-plugin-sdl", "simple-import-sort", "promise", "etc"],
  extends: [
    // TODO: add https://github.com/sindresorhus/eslint-plugin-unicorn
    //! Linting with hardcore is too slow
    // "hardcore",
    // "hardcore/ts",
    // "hardcore/node",
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:prettier/recommended",
    "plugin:promise/recommended",
    "plugin:nestjs/recommended",
    "plugin:@microsoft/eslint-plugin-sdl/recommended",
    "plugin:security/recommended",
    "plugin:etc/recommended"

  ],
  root: true,
  env: {
    node: true,
  },
  ignorePatterns: [".eslintrc.js"],
  rules: {
    "n/file-extension-in-import": "off",
    "n/no-missing-import": "off",
    "import/no-default-export": "error",
    "new-cap": "off",
    "putout/putout": "off",
    "total-functions/no-unsafe-enum-assignment": "off",
    "no-duplicate-imports": "off",
    "@typescript-eslint/consistent-type-imports": "error",
    "no-use-before-define": "off",
    "@typescript-eslint/no-use-before-define": ["error", { "enums": true, "typedefs": false, "ignoreTypeReferences": true }],
    "import/exports-last": "off",
    "require-await": "off",
    "@typescript-eslint/require-await": "error",
    "@typescript-eslint/prefer-readonly-parameter-types": "off",
    "indent": "off", // off because it does not work with decorators in backend types. Anyway prettier is implementing the same linting
    "linebreak-style": [
      "error",
      "unix"
    ],
    "quotes": "off",
    "semi": [
      "error",
      "always"
    ],
    "@typescript-eslint/parameter-properties": [
      1,
      {
        "allow": ["readonly", "private readonly", "protected readonly"],
        "prefer": "parameter-property"
      }
    ],
    "@typescript-eslint/lines-between-class-members": "error",
    "import/no-unused-modules": "off",
    "camelcase": ["error", { allow: ["^DI_"] }],
    "no-restricted-syntax": "off",
    "no-sequences": "off",
    "no-void": "off",
    "no-nested-ternary": "off",
    "import/no-unresolved": "off", // this resolves @components, @assets etc.
    "import/prefer-default-export": "off", // WHY: this rule is not aware of my plans to add more exports in the future
    "@typescript-eslint/interface-name-prefix": "off",
    "@typescript-eslint/no-shadow": "off",
    "@typescript-eslint/explicit-function-return-type": "error",
    "@typescript-eslint/explicit-module-boundary-types": "error",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-floating-promises": "error",
    "max-classes-per-file": "off",
    "no-unused-vars": "off", // WHY: unused variables should be commented out
    "@typescript-eslint/no-unused-vars": "warn", // WHY: unused variables should be commented out
    "@typescript-eslint/ban-ts-comment": ["error", { "ts-ignore": true }], // WHY: ts-expect-error should be used instead
    "@typescript-eslint/member-delimiter-style": [
      "error",
      {
        "multiline": {
          "delimiter": "semi",
          "requireLast": true
        },
        "singleline": {
          "delimiter": "semi",
          "requireLast": false
        }
      }
    ],
    "max-len": [
      "warn", // WHY: having max-len as an "error" interrupts coding too much.
      {
        "code": 100, // 100 was the default somewhere.
        "ignoreComments": true, // Ignoring comments speeds things up, and adds some expectable logic.
        "ignoreStrings": true, // Mostly convenient for imports.
        "ignoreTemplateLiterals": true, // Template literals can obviously be of any length.
        "ignoreRegExpLiterals": true, // Multiline RegExps may be harder to maintain.
        "ignorePattern": "^export abstract class DI_"
      }
    ],
    "@typescript-eslint/return-await": ["error", "always"],
    "@typescript-eslint/dot-notation": "off",
    "@typescript-eslint/no-misused-promises": "error",
    "no-return-await": "off",
    "@typescript-eslint/no-return-await": "off",
    "prettier/prettier": ["error", {
      "endOfLine": "auto"
    }],
    "simple-import-sort/imports": "off",
    "simple-import-sort/exports": "error"
  },
};
