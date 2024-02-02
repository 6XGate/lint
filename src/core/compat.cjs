'use strict'
Object.defineProperty(exports, '__esModule', { value: true })

const { FlatCompat } = require('@eslint/eslintrc')
const js = require('@eslint/js')
// eslint-disable-next-line n/no-missing-require -- Won't map till built.
const { shared } = require('../helpers/system.cjs')

const useFlatCompat = shared(() => {
  const basedir = process.cwd()

  return new FlatCompat({
    baseDirectory: basedir,
    resolvePluginsRelativeTo: basedir,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
  })
})

exports.default = useFlatCompat
