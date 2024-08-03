# Quick and Easy Opinionated ESLint Setup

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

  // Additions and everrides for ESLint.
  return {
    root: true,
    env: { es2021: true },
    reportUnusedDisableDirectives: true
  }
})
```

Support function from `defineConfig`.
- `useNode`
- `useTypeScript`
- `useVue`

JavaScript is always supported by default.

The following ESLint plug-ins are:
- `prettier`
- `n`
- `import`
- `promise`
- `typescript`
- `vue`
