import { defineComponent } from '../core/components.cjs'
import useLegacyConfig from '../core/legacy.cjs'
import ExtendComponent from './extend.cjs'
import ImportComponent from './import.cjs'
import PrettierComponent from './prettier.cjs'
import type { Linter } from 'eslint'

const kExtensions = ['.js', '.jsx', '.cjs', '.mjs']

function getStandardJavaScriptRules(): Linter.RulesRecord {
  return {
    'array-callback-return': 'error',
    'no-await-in-loop': 'warn',
    'no-constant-binary-expression': 'warn',
    'no-constructor-return': 'error',
    'no-promise-executor-return': 'error',
    'no-self-compare': 'warn',
    'no-new-native-nonconstructor': 'error',
    'no-template-curly-in-string': 'warn',
    'no-unmodified-loop-condition': 'error',
    'no-unreachable-loop': 'error',
    'no-unused-private-class-members': 'error',
    'no-unused-vars': [
      'error',
      {
        varsIgnorePattern: '^_',
        argsIgnorePattern: '^_'
      }
    ],
    // The default are too strict and not useful.
    'no-use-before-define': [
      'error',
      {
        functions: false,
        classes: false,
        enums: false,
        variables: false
      }
    ],

    // ## Suggestions
    'accessor-pairs': 'error',
    'arrow-body-style': 'error',
    'block-scoped-var': 'error',
    'consistent-return': 'error',
    'default-case': 'error',
    'default-case-last': 'error',
    'default-param-last': 'error',
    'dot-notation': 'error',
    'eqeqeq': ['error', 'always', { null: 'ignore' }],
    'func-name-matching': 'warn',
    'grouped-accessor-pairs': 'error',
    'guard-for-in': 'error',
    'new-cap': 'error',
    'no-alert': 'error',
    'no-array-constructor': 'error',
    'no-caller': 'error',
    'no-div-regex': 'error',
    'no-else-return': 'warn',
    'no-empty-function': 'warn',
    'no-empty-static-block': 'warn',
    'no-eval': 'error',
    'no-extend-native': 'error',
    'no-extra-bind': 'error',
    'no-floating-decimal': 'error',
    'no-implicit-coercion': 'error',
    'no-implicit-globals': 'error',
    'no-implied-eval': 'error',
    'no-iterator': 'error',
    'no-label-var': 'error',
    'no-labels': 'error',
    'no-lone-blocks': 'error',
    'no-lonely-if': 'error',
    'no-loop-func': 'error',
    'no-mixed-operators': 'error',
    'no-multi-assign': 'error',
    'no-multi-str': 'error',
    'no-nested-ternary': 'warn',
    'no-new': 'error',
    'no-new-func': 'error',
    'no-new-wrappers': 'error',
    'no-octal-escape': 'error',
    'no-return-assign': 'error',
    'no-script-url': 'error',
    'no-sequences': 'error',
    'no-shadow': 'error',
    'no-shadow-restricted-names': 'error',
    'no-throw-literal': 'error',
    'no-undef-init': 'error',
    'no-unneeded-ternary': 'error',
    'no-unused-expressions': 'error',
    'no-useless-call': 'error',
    'no-useless-computed-key': 'error',
    'no-useless-concat': 'error',
    'no-useless-constructor': 'error',
    'no-useless-rename': 'error',
    'no-useless-return': 'error',
    'no-var': 'error',
    'no-void': 'error',
    'object-shorthand': 'warn',
    'one-var': ['error', { initialized: 'never' }],
    'prefer-const': 'warn',
    'prefer-exponentiation-operator': 'warn',
    'prefer-numeric-literals': 'warn',
    'prefer-object-spread': 'warn',
    'prefer-promise-reject-errors': 'warn',
    'prefer-regex-literals': 'warn',
    'prefer-rest-params': 'warn',
    'prefer-spread': 'warn',
    'prefer-template': 'warn',
    'radix': 'error',
    'require-await': 'error',
    'require-unicode-regexp': 'error',
    'yoda': 'error',
    // Handled by and conflicts with prettier.
    'no-extra-semi': 'off'
  }
}

function getRecommendedJavaScriptRules() {
  return useLegacyConfig().getRules('eslint:recommended')
}

const JavaScriptComponent = Object.assign(
  defineComponent('javascript', ({ getComponent }) => {
    function getExtensions() {
      return [...kExtensions]
    }

    function enable() {
      getComponent(ExtendComponent).enable()
    }

    function getDependencies() {
      // These would have to be present to even load this program.
      // But, include it anyways to keep thing normal in case
      // this program moves to flat configuration or can
      // eventually use dynamic imports.
      return ['eslint']
    }

    function getPrecedingComponents() {
      return [getComponent(ImportComponent), getComponent(PrettierComponent), getComponent(ExtendComponent)]
    }

    function preConfigure() {
      getComponent(ExtendComponent).extend({ before: 'eslint:recommended', after: 'prettier' })

      const theImportComponent = getComponent(ImportComponent)
      theImportComponent.enableResolver('node')
      theImportComponent.addExtensions(...kExtensions)
      theImportComponent.addExternalModuleFolders('node_modules')
    }

    function configure(config: Linter.Config) {
      config.rules = {
        ...config.rules,
        ...getStandardJavaScriptRules()
      }

      return config
    }

    return {
      getExtensions,
      getDependencies,
      getPrecedingComponents,
      enable,
      preConfigure,
      configure
    }
  }),
  {
    getStandardJavaScriptRules,
    getRecommendedJavaScriptRules
  }
)

export default JavaScriptComponent
