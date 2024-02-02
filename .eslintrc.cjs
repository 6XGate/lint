'use strict'
const { defineConfig } = require('./dist/index.cjs')

module.exports = defineConfig(({ useNode, useTypeScript }) => {
  useNode()
  useTypeScript('./tsconfig.json')

  return {
    root: true,
    env: { es2021: true },
    reportUnusedDisableDirectives: true
  }
})
