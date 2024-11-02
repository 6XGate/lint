import { uniq } from 'lodash'
import { z } from 'zod'
import { defineComponent } from '../core/components.cjs'
import { asArray } from '../helpers/collections.cjs'
import { isNotNullish } from '../helpers/types.cjs'
import type { Linter } from 'eslint'

const BaseSpec = z.union([
  z
    .string()
    .min(1)
    .transform((value) => [value]),
  z.array(z.string().min(1)).transform(uniq)
])

const ExtendOptions = z
  .object({
    before: BaseSpec,
    after: BaseSpec
  })
  .partial()

const Options = z.union([BaseSpec.transform((before) => ExtendOptions.parse({ before })), ExtendOptions]).default({})

type Options = z.input<typeof Options>

const ExtendComponent = defineComponent('extend', () => {
  const settings = {
    before: new Set<string>(),
    after: new Set<string>()
  }

  function configure(config: Linter.Config) {
    config.extends = [...settings.before, ...asArray(config.extends).filter(isNotNullish), ...settings.after]

    return config
  }

  function extendConfigs(options?: Options, ...bases: string[]) {
    const parsed = Options.parse(options)
    if (parsed.before != null) {
      for (const base of parsed.before) {
        settings.before.add(base)
      }
    }

    if (parsed.after != null) {
      for (const base of parsed.after) {
        settings.after.add(base)
      }
    }

    for (const base of bases) {
      settings.before.add(base)
    }
  }

  return {
    configure,
    extend: extendConfigs
  }
})

export default ExtendComponent
