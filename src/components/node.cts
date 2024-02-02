import { merge } from 'lodash'
import { z } from 'zod'
import { defineComponent } from '../core/components.cjs'
import ExtendComponent from './extend.cjs'
import JavaScriptComponent from './javascript.cjs'
import type { Linter } from 'eslint'

/** Component settings schema */
const Settings = z.object({
  /** Version spec of Node.js being used. */
  version: z.string().min(1).optional()
})

/** Node.js options. */
export type Options = z.input<typeof Options>
/** Node.js options schema. */
export const Options = Settings.partial().default({})

const NodeComponent = defineComponent('node', ({ getComponent }) => {
  const settings = Settings.parse({})

  function getStandardNodeRules(): Linter.RulesRecord {
    return {
      'n/handle-callback-err': 'error',
      'n/no-callback-literal': 'error',
      'n/no-new-require': 'error',
      'n/no-path-concat': 'error'
    }
  }

  function enable(options?: Options | undefined) {
    getComponent(ExtendComponent).enable()

    merge(settings, Options.parse(options))
  }

  function getDependencies() {
    return ['eslint-plugin-n']
  }

  function getPrecedingComponents() {
    return [getComponent(ExtendComponent)]
  }

  function getPriorComponents() {
    return [getComponent(JavaScriptComponent)]
  }

  function preConfigure() {
    getComponent(ExtendComponent).extend('plugin:n/recommended')
  }

  function configure(config: Linter.Config) {
    config.env = {
      ...config.env,
      node: true
    }

    config.settings = {
      ...config.settings,
      ...(settings.version != null ? { version: settings.version } : {})
    }

    config.rules = {
      ...config.rules,
      ...getStandardNodeRules()
    }

    return config
  }

  return {
    enable,
    getDependencies,
    getPrecedingComponents,
    getPriorComponents,
    preConfigure,
    configure
  }
})

export default NodeComponent
