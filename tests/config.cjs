const { defineConfig } = require('../dist/index.cjs')

const config = defineConfig(({ useNode, useTypeScript }) => {
  useNode()
  useTypeScript('./tsconfig.json')

  return {
    root: true,
    reportUnusedDisableDirectives: true,
    rules: {
      'import/order': ['error']
    }
  }
})

console.log(JSON.stringify(config, undefined, '  '))
