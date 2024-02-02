import type { Isolate } from './isolate.cjs'
import type { Linter } from 'eslint'

/* eslint-disable @typescript-eslint/no-explicit-any -- Needed to properly match everything. */

export interface CommonComponentBindings {
  /** Gets the file extensions a language component will support linting. */
  getExtensions?: () => string[]
  /** Indicates which node modules the component depends on. */
  getDependencies?: () => string[]
  /** Indicates which components this one should be ordered before in processing. */
  getPrecedingComponents?: () => Component<any>[]
  /** Indicates which components this one should be ordered after in processing. */
  getPriorComponents?: () => Component<any>[]
  /** Configuration pre-processing  */
  preConfigure?: () => void
  /** Configuration processing. */
  configure?: (config: Linter.Config) => Linter.Config
  /** Configuration post-processing  */
  postConfigure?: (config: Linter.Config) => Linter.Config
}

/** Bindings for the basic functionality of a component. */
export interface BasicComponentBindings extends CommonComponentBindings {
  enable?: undefined
}

/** Bindings for a component with enablement options or arguments. */
export interface ConfigurableComponentBindings<Args extends unknown[]> extends CommonComponentBindings {
  /** Enables the component. */
  enable: (...args: Args) => void
}

export interface Component<Args extends unknown[]> {
  /** The name of the component. */
  readonly name: string
  /** The file extensions a language component will support linting. */
  readonly extensions: string[]
  /** Indicates which node modules the component depends on. */
  readonly dependencies: string[]
  /** Indicates which components this one should be ordered before in processing. */
  readonly before: Component<any>[]
  /** Indicates which components this one should be ordered after in processing. */
  readonly after: Component<any>[]
  /** Indicates whether the component is enabled. */
  readonly enabled: boolean
  /** Enables the component. */
  enable: (...args: Args) => void
  /** Configuration pre-processing  */
  preConfigure: () => void
  /** Configuration processing. */
  configure: (config: Linter.Config) => Linter.Config
  /** Configuration post-processing  */
  postConfigure: (config: Linter.Config) => Linter.Config
}

export interface ComponentFactory<Args extends unknown[], Instance extends Component<Args>> {
  (isolate: Isolate): Instance
  getComponentName: () => string
}

export type ArgsOfComponent<C> = C extends Component<infer Args> ? Args : never

export type ArgsFromFactory<F> = F extends ComponentFactory<any, infer Instance> ? ArgsOfComponent<Instance> : never

export type ArgsOfBindings<C> = C extends ConfigurableComponentBindings<infer Args extends unknown[]>
  ? Args
  : C extends BasicComponentBindings
  ? []
  : never

export type ComponentSetupContext = ReturnType<typeof makeSetupContext>

function makeSetupContext(isolate: Isolate) {
  const { logger, getComponent } = isolate

  return {
    get logger() {
      return logger
    },
    getComponent
  }
}

export function defineComponent<Bindings extends BasicComponentBindings | ConfigurableComponentBindings<any>>(
  name: string,
  setup: (context: ComponentSetupContext) => Bindings
) {
  const factory = Object.assign(
    (isolate: Isolate) => {
      const setupContext = makeSetupContext(isolate)
      const basis = setup(setupContext)
      const {
        getExtensions,
        getDependencies,
        preConfigure,
        configure,
        postConfigure,
        getPrecedingComponents,
        getPriorComponents,
        enable,
        ...bindings
      } = basis

      let isActivated = false

      const instance = {
        get name() {
          return name
        },
        get extensions() {
          return getExtensions?.() ?? []
        },
        get dependencies() {
          return getDependencies?.() ?? []
        },
        get before() {
          return getPrecedingComponents?.() ?? []
        },
        get after() {
          return getPriorComponents?.() ?? []
        },
        get enabled() {
          return isActivated
        },
        enable:
          enable != null
            ? (...args: ArgsOfBindings<Bindings>) => {
                enable(...(args as unknown[]))
                isActivated = true
              }
            : () => {
                isActivated = true
              },
        preConfigure: () => {
          preConfigure?.()
        },
        configure: (config: Linter.Config) => configure?.(config) ?? config,
        postConfigure: (config: Linter.Config) => postConfigure?.(config) ?? config,
        ...bindings
      }

      return instance
    },
    {
      getComponentName: () => name
    }
  )

  return factory
}
