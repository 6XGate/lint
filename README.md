# Quick and Easy Opinionated Linting Setup

## ESLint

Provides a strict, quick, and easy to setup opinionated ESLint rule set for;

- JavaScript
- TypeScript
- Node.js
- Vue.

These rulesets are loosely based on Standard JS and Standard TS.

The setup should use a `.eslintrc.cjs` file.

Example:

```js
'use strict'
const { defineConfig } = require('./dist/index.cjs')

module.exports = defineConfig(({ useNode, useTypeScript }) => {
  // Enable these rulesets:
  useNode()
  useTypeScript('./tsconfig.json')

  // Additions and overrides for ESLint.
  return {
    root: true,
    env: { es2021: true },
    reportUnusedDisableDirectives: true
  }
})
```

Support function from `defineConfig`.

- `usePrettier`
- `useNode`
- `useTypeScript`
- `useVue`

JavaScript is always supported by default.

The following ESLint plug-ins are used:

- `prettier`
- `n`
- `import`
- `promise`
- `typescript`
- `vue`

## Prettier

Provides a compatible opinionated Prettier configuration to run Prettier separately.

Simply add a `prettier.config.cjs` with the following contents:

```js
module.exports = require('@sixxgate/lint/prettier.config.cjs')
```
