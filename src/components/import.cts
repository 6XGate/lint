import { defineComponent } from '../core/components.cjs'
import { MappedSets } from '../helpers/collections.cjs'
import ExtendComponent from './extend.cjs'
import type { Linter } from 'eslint'

function getStandardImportRules(): Linter.RulesRecord {
  return {
    // # Import
    //
    // Inspired by Standard.
    //
    // Basic import rules. These will go beyond the recommended import plug-in configuration.
    // Overtime, rules added to the recommended configuration should be removed from
    // here, except in the rare case where we will differ from the default.

    // ## Helpful warnings

    'import/no-empty-named-blocks': 'error',
    'import/no-mutable-exports': 'error',
    'import/no-unused-modules': 'error',

    // ## Module system

    'import/no-amd': 'error',
    // TODO: import/no-import-module-exports

    // ## Static analysis

    'import/default': 'off',
    'import/no-absolute-path': 'error',
    'import/no-cycle': 'warn',
    'import/no-dynamic-require': 'error',
    // TODO: import/no-internal-modules
    // TODO: import/no-relative-packages
    'import/no-self-import': 'error',
    'import/no-useless-path-segments': 'error',

    // ## Style guide

    'import/consistent-type-specifier-style': 'error',
    'import/first': 'error',
    'import/newline-after-import': 'error',
    'import/no-anonymous-default-export': 'error',
    'import/order': [
      'warn',
      {
        groups: ['builtin', 'external', 'parent', 'sibling', 'index', 'type'],
        alphabetize: { order: 'asc' }
      }
    ]
  }
}

const ImportComponent = Object.assign(
  defineComponent('import', ({ getComponent }) => {
    const settings = {
      parsers: new MappedSets<string, string>(),
      extensions: new Set<string>(),
      externalModuleFolders: new Set<string>(),
      resolvers: new Set<string>()
    }

    function enable() {
      getComponent(ExtendComponent).enable()
    }

    function getDependencies() {
      return [
        'eslint-plugin-import',
        ...Array.from(settings.resolvers).map((resolver) => `eslint-import-resolver-${resolver}`)
      ]
    }

    function getPrecedingComponents() {
      return [getComponent(ExtendComponent)]
    }

    function preConfigure() {
      getComponent(ExtendComponent).extend('plugin:import/recommended')
    }

    function configure(config: Linter.Config) {
      config.settings = {
        ...config.settings,
        'import/parsers': Object.fromEntries(
          Array.from(settings.parsers).map(([parser, extensions]) => [parser, Array.from(extensions)] as const)
        ),
        'import/extensions': Array.from(settings.extensions),
        'import/external-module-folders': Array.from(settings.externalModuleFolders),
        'import/resolver': Object.fromEntries(
          Array.from(settings.resolvers).map((resolver) => [resolver, true] as const)
        )
      }

      config.rules = {
        ...config.rules,
        ...getStandardImportRules()
      }

      return config
    }

    function addParser(parser: string, extensions: string[]) {
      settings.parsers.add(parser, ...extensions)
    }

    function addExtensions(...extensions: string[]) {
      for (const extension of extensions) {
        settings.extensions.add(extension)
      }
    }

    function addExternalModuleFolders(...folders: string[]) {
      for (const folder of folders) {
        settings.externalModuleFolders.add(folder)
      }
    }

    function enableResolver(name: string) {
      settings.resolvers.add(name)
    }

    return {
      enable,
      getDependencies,
      getPrecedingComponents,
      preConfigure,
      configure,
      getStandardImportRules,
      addParser,
      addExtensions,
      addExternalModuleFolders,
      enableResolver
    }
  }),
  {
    getStandardImportRules
  }
)

export default ImportComponent
