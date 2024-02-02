import useLegacyConfig from './legacy.cjs'
import type { Linter } from 'eslint'

export function isRuleOff(settings?: Linter.RuleEntry | null | undefined) {
  return (
    settings == null ||
    settings === 0 ||
    (Array.isArray(settings) && (settings[0] === 0 || settings[0].toString().toUpperCase() === 'OFF')) ||
    settings.toString().toUpperCase() === 'OFF'
  )
}

export function isRuleOn(settings?: Linter.RuleEntry | null | undefined) {
  return !isRuleOff(settings)
}

export function propagate(rules: Linter.RulesRecord, excludes: string[], pluginName: string) {
  const legacy = useLegacyConfig()
  const plugin = legacy.getPlugin(pluginName)
  if (plugin == null) {
    return {}
  }

  if (plugin.rules == null) {
    return {}
  }

  const result = {} as Linter.RulesRecord
  for (const [name, settings] of Object.entries(rules)) {
    if (Reflect.has(plugin.rules, name) && isRuleOn(settings)) {
      result[name] = 'off'
      // Activate the extended rule if not exlcuded; we still
      // want the base ESLint rule off regardless.
      result[`${pluginName}/${name}`] = !excludes.includes(name) ? settings : 'off'
    }
  }

  return result
}
