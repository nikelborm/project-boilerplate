module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin', '@darraghor/nestjs-typed', 'nestjs'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
    'plugin:nestjs/recommended',
  ],
  root: true,
  env: {
    node: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'error',
    '@typescript-eslint/explicit-module-boundary-types': 'error',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-floating-promises': 'error',
    'max-classes-per-file': 'off',
    '@typescript-eslint/no-misused-promises': 'error',
    'no-return-await': 'off',
    '@typescript-eslint/return-await': ['error', 'always'],
    'prettier/prettier': ['error', {
      'endOfLine':'auto'
    }],
    "@darraghor/nestjs-typed/api-method-should-specify-api-response": "off",
    "@darraghor/nestjs-typed/provided-injected-should-match-factory-parameters":
            "error",
        "@darraghor/nestjs-typed/injectable-should-be-provided": "off",
        // [ // its off because there is bug with repos and attempts to disable the from checking
        //     "error",
        //     {
        //         src: ["src/modules/**/*.ts"],
        //         filterFromPaths: ["user", "node_modules", ".test.", ".spec."],
        //     },
        // ],
        "@darraghor/nestjs-typed/api-property-matches-property-optionality":
            "error",
        "@darraghor/nestjs-typed/controllers-should-supply-api-tags": "error",
        "@darraghor/nestjs-typed/api-enum-property-best-practices": "error",
        "@darraghor/nestjs-typed/api-property-returning-array-should-set-array":
            "error",
        "@darraghor/nestjs-typed/should-specify-forbid-unknown-values": "error",
        "@darraghor/nestjs-typed/param-decorator-name-matches-route-param":
            "error",
        "@darraghor/nestjs-typed/validated-non-primitive-property-needs-type-decorator":
            "error",
        "@darraghor/nestjs-typed/validate-nested-of-array-should-set-each":
            "error",
        "@darraghor/nestjs-typed/all-properties-are-whitelisted": "error",
        "@darraghor/nestjs-typed/all-properties-have-explicit-defined": "error",
        "@darraghor/nestjs-typed/api-methods-should-be-guarded": "off",
  },
};
