import baseConfig from '../../prettier.config.cjs'
import { defineComponent } from '../core/components.cjs'
import useLegacyConfig from '../core/legacy.cjs'
import ExtendComponent from './extend.cjs'
import type { Linter } from 'eslint'

function getStandardPrettierRules(): Linter.RulesRecord {
  return {
    'prettier/prettier': [
      'warn',
      {
        editorconfig: true,
        ...baseConfig
      }
    ]
  }
}

const PrettierComponent = Object.assign(
  defineComponent('prettier', ({ getComponent }) => {
    const legacy = useLegacyConfig()

    function enable() {
      getComponent(ExtendComponent).enable()
    }

    function getDependencies() {
      return ['prettier', 'eslint-plugin-prettier', 'eslint-config-prettier']
    }

    function getPrecedingComponents() {
      return [getComponent(ExtendComponent)]
    }

    function preConfigure() {
      getComponent(ExtendComponent).extend({ after: ['plugin:prettier/recommended'] })
    }

    function configure(config: Linter.Config) {
      config.rules = {
        ...config.rules,
        // Make sure any rules are disabled that will conflict.
        ...legacy.getRules('plugin:prettier/recommended'),
        // Setup prettier configuration as close to standard as possible.
        ...getStandardPrettierRules()
      }

      return config
    }

    return {
      enable,
      getDependencies,
      getPrecedingComponents,
      preConfigure,
      configure
    }
  }),
  {
    getStandardPrettierRules
  }
)

export default PrettierComponent
