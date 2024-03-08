/* eslint-disable import/no-cycle -- Safe use. */
import { uniq } from 'lodash'
import { z } from 'zod'
import { defineComponent } from '../core/components.cjs'
import { propagate } from '../core/propagation.cjs'
import ExtendComponent from './extend.cjs'
import ImportComponent from './import.cjs'
import JavaScriptComponent from './javascript.cjs'
import NodeComponent from './node.cjs'
import PrettierComponent from './prettier.cjs'
import VueComponent from './vue.cjs'
import type { Linter } from 'eslint'

const kExtensions = ['.ts', '.tsx', '.cts', '.mts']

const kExcludes = ['no-redeclare']

function getStandardTypeScriptRules(): Linter.RulesRecord {
  return {
    ...propagate(JavaScriptComponent.getRecommendedJavaScriptRules(), kExcludes, '@typescript-eslint'),
    ...propagate(JavaScriptComponent.getStandardJavaScriptRules(), kExcludes, '@typescript-eslint'),

    // # TypeScript
    //
    // Inspired by Standard with TypeScript.
    //
    // TypeScript rules. These will go beyond the TypeScript strict and stylistic configuration.
    // Overtime, rules added to those TypeScript configuration should be removed from
    // here, except in the rare case where we will differ from the default.
    '@typescript-eslint/consistent-type-exports': 'error',
    '@typescript-eslint/consistent-type-imports': 'error',
    '@typescript-eslint/prefer-readonly': 'error',
    '@typescript-eslint/promise-function-async': 'error',
    '@typescript-eslint/require-array-sort-compare': 'error',
    '@typescript-eslint/return-await': ['error', 'always'],
    // The default are too strict and not useful.
    '@typescript-eslint/no-use-before-define': [
      'error',
      {
        functions: false,
        classes: false,
        enums: false,
        variables: false,
        typedefs: false // Only the TypeScript rule has this option.
      }
    ],
    // Very strict compared to the default options.
    '@typescript-eslint/strict-boolean-expressions': [
      'error',
      {
        allowString: false,
        allowNumber: false,
        allowNullableObject: false,
        allowNullableBoolean: false,
        allowNullableString: false,
        allowNullableNumber: false,
        allowAny: false
      }
    ],
    // A lot of situations where rest arguments are used need any, especially when dealing with constratins.
    '@typescript-eslint/no-explicit-any': 'off' /* [
      'off',
      {
        ignoreRestArgs: true
      }
    ], */,
    // Causes too many issues with callback parameters,
    // so this will be a rare diviation from strict.
    '@typescript-eslint/unified-signatures': 'off',
    // Handled by and conflicts with prettier.
    '@typescript-eslint/no-extra-semi': 'off'
  }
}

const TypeScriptComponent = Object.assign(
  defineComponent('typescript', ({ getComponent }) => {
    const settings = {
      projects: new Array<string>(),
      parser: '@typescript-eslint/parser'
    }

    const ProjectList = z.array(z.string().min(1))
    function enable(...projects: z.input<typeof ProjectList>) {
      getComponent(ExtendComponent).enable()
      getComponent(VueComponent).useScriptLang('typescript')
      settings.projects.push(...ProjectList.parse(projects))
    }

    function getExtensions() {
      return [...kExtensions]
    }

    function getDependencies() {
      return uniq(['@typescript-eslint/eslint-plugin', '@typescript-eslint/parser', settings.parser])
    }

    function getPrecedingComponents() {
      return [getComponent(PrettierComponent), getComponent(ExtendComponent)]
    }

    function getPriorComponents() {
      return [getComponent(JavaScriptComponent), getComponent(ImportComponent)]
    }

    function preConfigure() {
      getComponent(ExtendComponent).extend(
        'plugin:@typescript-eslint/strict-type-checked',
        'plugin:@typescript-eslint/stylistic-type-checked'
      )

      const theImportComponent = getComponent(ImportComponent)
      theImportComponent.addParser(settings.parser, kExtensions)
      theImportComponent.addExtensions(...kExtensions)
      theImportComponent.addExternalModuleFolders('node_modules/@types')
      theImportComponent.enableResolver('typescript')
    }

    function configure(config: Linter.Config) {
      config.parser = settings.parser
      config.parserOptions = {
        ...config.parserOptions,
        project: settings.projects
      }

      config.rules = {
        ...config.rules,
        ...getStandardTypeScriptRules()
      }

      config.overrides = config.overrides ?? []
      config.overrides.push({
        files: ['**/*.js', '**/*.cjs', '**/*.mjs', '**/*.jsx'],
        extends: ['plugin:@typescript-eslint/disable-type-checked'],
        rules: {
          // This is transpiled by TypeScript and not support in JavaScript.
          '@typescript-eslint/no-var-requires': 'off'
        }
      })

      return config
    }

    function postConfigure(config: Linter.Config) {
      config.rules = {
        ...config.rules,
        // If it is explicitly defined, it is likely required,
        // there are some situations where any is required
        // no if-and-or-buts.
        '@typescript-eslint/no-explicit-any': 'warn',
        // TypeScript handles this, but import also seems to
        // have some issues with the complexities of
        // TypeScript module resolution, even
        // with the resolver enabled.
        'import/no-unresolved': 'off',
        // TypeScript also handles the same situations
        // as nodes no missing import.
        ...(getComponent(NodeComponent).enabled ? { 'n/no-missing-import': 'off' } : {})
      }

      return config
    }

    const ProjectName = z.string().min(1)
    function addProject(project: string) {
      settings.projects.push(ProjectName.parse(project))
    }

    const ParserName = z.string().min(1)
    function useParser(parser: z.input<typeof ParserName>) {
      settings.parser = ParserName.parse(parser)
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
      addProject,
      useParser
    }
  }),
  {
    getStandardTypeScriptRules
  }
)

export default TypeScriptComponent
