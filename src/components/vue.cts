/* eslint-disable import/no-cycle -- Safe use. */
import { merge } from 'lodash'
import { z } from 'zod'
import { defineComponent } from '../core/components.cjs'
import { propagate } from '../core/propagation.cjs'
import { defineDependencies } from '../helpers/dependencies.cjs'
import ExtendComponent from './extend.cjs'
import ImportComponent from './import.cjs'
import JavaScriptComponent from './javascript.cjs'
import PrettierComponent from './prettier.cjs'
import TypeScriptComponent from './typescript.cjs'
import type { Linter } from 'eslint'

/** Vue mark-up language. */
export type MarkupLang = z.infer<typeof MarkupLang>
/** Vue mark-up language schema. */
export const MarkupLang = z.enum(['html'])

/** Vue script language. */
export type ScriptLang = z.infer<typeof ScriptLang>
/** Vue script language schema. */
export const ScriptLang = z.enum(['javascript', 'typescript'])

/** Vue style language. */
export type StyleLang = z.infer<typeof StyleLang>
/** Vue style language schema. */
export const StyleLang = z.enum(['css', 'sass', 'less', 'stylus'])

/** I18n translation format. */
export type TranslationFormat = z.infer<typeof TranslationFormat>
/** I18n translation format schema. */
export const TranslationFormat = z.enum(['json', 'yaml'])

/** Component settings schema */
const Settings = z.object({
  /** Version spec of Vue being used. */
  version: z.string().min(1).default('^3.0.0'),
  /** Expected mark-up language. */
  markup: MarkupLang.default('html'),
  /** Expected scripting language. */
  script: ScriptLang.default('javascript'),
  /** Expected styling language. */
  style: StyleLang.default('css'),
  /** Expected translation format. */
  translation: TranslationFormat.default('yaml')
})

/** Vue options. */
export type Options = z.input<typeof Options>
/** Vue options schema. */
export const Options = Settings.partial().default({})

type BlockLanguageOptions<Blocks extends string = string> = Record<
  Blocks,
  {
    lang: string | string[]
    allowNoLang?: boolean
  }
>

const VueComponent = defineComponent('vue', ({ getComponent }) => {
  const settings = Settings.parse({})

  function getMarkupLangOptions(): BlockLanguageOptions<'template'> {
    // When adding support for other languages, the switch will be used.
    return { template: { lang: 'html', allowNoLang: true } }
    // switch (settings.markup) {
    //   case 'html':
    //   default:
    //     return { template: { lang: 'html', allowNoLang: true } }
    // }
  }

  function getScriptLangOptions(): BlockLanguageOptions<'script'> {
    switch (settings.script) {
      case 'typescript':
        return { script: { lang: 'ts' } }
      case 'javascript':
      default:
        return { script: { lang: 'js', allowNoLang: true } }
    }
  }

  function getStyleLangOptions(): BlockLanguageOptions<'style'> {
    switch (settings.style) {
      case 'sass':
        return { style: { lang: ['sass', 'scss'] } }
      case 'less':
        return { style: { lang: 'less' } }
      case 'stylus':
        return { style: { lang: 'stylus' } }
      case 'css':
      default:
        return { style: { lang: 'css', allowNoLang: true } }
    }
  }

  function getTranslationLanguage(): BlockLanguageOptions<'i18n'> {
    switch (settings.translation) {
      case 'json':
        return { i18n: { lang: 'json' } }
      case 'yaml':
      default:
        return { i18n: { lang: ['yaml', 'yml'] } }
    }
  }

  function getStandardVueRules(): Linter.RulesRecord {
    return {
      ...propagate(JavaScriptComponent.getRecommendedJavaScriptRules(), [], 'vue'),
      ...propagate(JavaScriptComponent.getStandardJavaScriptRules(), [], 'vue'),

      // # Vue
      //
      // Inspired by Standard and Standard with TypeScript.
      //
      // Vue rules. These will go beyond the Vue 3 recommended configuration. Overtime, rules
      // added to the Vue 3 recommended configuration should be removed from here,
      // except in the rare case where we will differ from the default.
      'vue/block-lang': [
        'error',
        {
          ...getMarkupLangOptions(),
          ...getScriptLangOptions(),
          ...getStyleLangOptions(),
          ...getTranslationLanguage()
        }
      ],
      'vue/multi-word-component-names': 'off',
      'vue/component-api-style': 'error',
      'vue/component-name-in-template-casing': ['error', 'PascalCase', { registeredComponentsOnly: false }],
      'vue/component-options-name-casing': 'error',
      'vue/custom-event-name-casing': 'error',
      'vue/define-emits-declaration': 'error',
      'vue/define-macros-order': 'warn',
      'vue/define-props-declaration': 'error',
      'vue/html-button-has-type': 'error',
      'vue/no-deprecated-model-definition': 'error',
      'vue/no-duplicate-attr-inheritance': 'error',
      'vue/no-required-prop-with-default': 'error',
      'vue/no-setup-props-reactivity-loss': 'error',
      'vue/no-static-inline-styles': 'error',
      'vue/no-template-target-blank': 'error',
      'vue/no-this-in-before-route-enter': 'error',
      'vue/no-unsupported-features': ['error', { version: settings.version }],
      'vue/no-unused-properties': 'warn',
      'vue/no-unused-refs': 'warn',
      'vue/no-use-v-else-with-v-for': 'error',
      'vue/no-useless-mustaches': 'error',
      'vue/no-useless-v-bind': 'error',
      'vue/no-v-text': 'error',
      'vue/prefer-define-options': 'error',
      'vue/prefer-separate-static-class': 'error',
      'vue/prefer-true-attribute-shorthand': 'error',
      'vue/require-macro-variable-name': 'warn',
      'vue/static-class-names-order': 'warn',
      // TODO: vue/v-for-delimiter-style
      'vue/valid-define-options': 'error',

      // ## Extension rules
      //
      // These extension rules do not use the same configuration as
      // the rule they are an extension of. If this changes,
      // remove the rule from here.
      'vue/no-unused-vars': ['error', { ignorePattern: '^_' }]
    }
  }

  function enable(options?: Options) {
    getComponent(ExtendComponent).enable()

    const theTypeScriptComponent = getComponent(TypeScriptComponent)
    theTypeScriptComponent.useParser('typescript-eslint-parser-for-extra-files')
    if (settings.script === 'typescript' && !theTypeScriptComponent.enabled) {
      theTypeScriptComponent.enable()
    }

    merge(settings, Options.parse(options))
  }

  function getExtensions() {
    return ['.vue']
  }

  function getDependencies() {
    return defineDependencies({
      'eslint-plugin-vue': true,
      'vue-eslint-parser': true,
      '@vue/eslint-config-typescript': () => settings.script === 'typescript',
      '@vue/eslint-config-prettier': true
    })
  }

  function getPrecedingComponents() {
    return [getComponent(PrettierComponent), getComponent(ExtendComponent)]
  }

  function getPriorComponents() {
    return [getComponent(JavaScriptComponent), getComponent(ImportComponent), getComponent(TypeScriptComponent)]
  }

  function preConfigure() {
    const theExtendComponent = getComponent(ExtendComponent)

    theExtendComponent.extend('plugin:vue/vue3-recommended')
    getComponent(ImportComponent).addParser('vue-eslint-parser', ['.vue'])
    if (getComponent(TypeScriptComponent).enabled) {
      theExtendComponent.extend('@vue/eslint-config-typescript')
    }

    if (getComponent(PrettierComponent).enabled) {
      theExtendComponent.extend('@vue/eslint-config-prettier/skip-formatting')
    }
  }

  function configure(config: Linter.Config) {
    config.parserOptions = {
      ...config.parserOptions,
      extraFileExtensions: ['.vue'],
      parser: config.parser
    }

    config.parser = 'vue-eslint-parser'

    config.rules = {
      ...config.rules,
      ...getStandardVueRules()
    }

    return config
  }

  function postConfigure(config: Linter.Config) {
    config.rules = {
      ...config.rules,
      // Does not play well with `exactOptionalPropertyTypes`,
      // at this time.
      'vue/require-default-prop': 'off'
    }

    return config
  }

  function useMarkupLang(lang: MarkupLang) {
    settings.markup = MarkupLang.parse(lang)
  }

  function useScriptLang(lang: ScriptLang) {
    settings.script = ScriptLang.parse(lang)
  }

  function useStyleLang(lang: StyleLang) {
    settings.style = StyleLang.parse(lang)
  }

  return {
    enable,
    getExtensions,
    getDependencies,
    getPrecedingComponents,
    getPriorComponents,
    preConfigure,
    configure,
    postConfigure,
    getStandardVueRules,
    useMarkupLang,
    useScriptLang,
    useStyleLang
  }
})

export default VueComponent
