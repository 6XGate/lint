import { shared } from '../helpers/system.cjs'
import useFlatCompat from './compat.cjs'
import type { Linter } from 'eslint'

type LinterConfig = Required<Linter.Config>
export type LinterConfigEnv = LinterConfig['env']

const useLegacyConfig = shared(() => {
  function makeFlat(config: Linter.Config) {
    const legacy = useFlatCompat()

    return legacy.config(config)
  }

  function getConfig(name: string) {
    const legacy = useFlatCompat()

    return legacy.extends(name).at(0) ?? null
  }

  function getPlugin(name: string) {
    const legacy = useFlatCompat()

    const configs = legacy.plugins(name)
    for (const config of configs) {
      const plugin = config.plugins?.[name]
      if (plugin != null) {
        return plugin
      }
    }

    return null
  }

  function getRules(...names: string[]) {
    const legacy = useFlatCompat()

    return legacy
      .extends(...names)
      .map(config => config.rules ?? null)
      .reduce<Linter.RulesRecord>((prev, rules) => ({ ...prev, ...rules }), {})
  }

  function getConfigForEnvironments(env: LinterConfigEnv) {
    const legacy = useFlatCompat()

    return legacy.env(env)
  }

  function getConfigForPlugin(...names: string[]) {
    const legacy = useFlatCompat()

    return legacy.plugins(...names)
  }

  function extendConfigs(...names: string[]) {
    const legacy = useFlatCompat()

    return legacy.extends(...names)
  }

  return {
    makeFlat,
    getConfig,
    getPlugin,
    getRules,
    getConfigForEnvironments,
    getConfigForPlugin,
    extendConfigs
  }
})

export default useLegacyConfig
