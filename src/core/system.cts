import process from 'node:process'
import { merge } from 'lodash'
import ExtendComponent from '../components/extend.cjs'
import ImportComponent from '../components/import.cjs'
import JavaScriptComponent from '../components/javascript.cjs'
import NodeComponent from '../components/node.cjs'
import PrettierComponent from '../components/prettier.cjs'
import PromiseComponent from '../components/promise.cjs'
import TypeScriptComponent from '../components/typescript.cjs'
import VueComponent from '../components/vue.cjs'
import NodePackageManager from '../managers/npm.cjs'
import PerformantNodePackageManager from '../managers/pnpm.cjs'
import YarnPackageManager from '../managers/yarn.cjs'
import { useIsolate } from './isolate.cjs'
import type { ArgsFromFactory } from './components.cjs'
import type { Isolate } from './isolate.cjs'
import type { Linter } from 'eslint'

export type DefineConfigApi = ReturnType<typeof useDefineConfigApi>

export function useDefineConfigApi(isolate: Isolate) {
  const { registerComponent, getComponent, registerPackageManager, getPackageManager, findPackageManager } = isolate

  // Register the default set of components, some will be auto-enabled or power the defineConfig API.
  const theJavaScriptComponent = registerComponent(JavaScriptComponent)
  const theTypeScriptComponent = registerComponent(TypeScriptComponent)
  const theImportComponent = registerComponent(ImportComponent)
  const theNodeComponent = registerComponent(NodeComponent)
  const thePromiseComponent = registerComponent(PromiseComponent)
  const theVueComponent = registerComponent(VueComponent)
  const thePrettierComponent = registerComponent(PrettierComponent)
  const theExtendComponent = registerComponent(ExtendComponent)

  registerPackageManager(NodePackageManager, true)
  registerPackageManager(PerformantNodePackageManager)
  registerPackageManager(YarnPackageManager)

  function extend(base: string, ...more: string[]) {
    theExtendComponent.enable()
    theExtendComponent.extend(base, ...more)
  }

  function useNode(...args: ArgsFromFactory<typeof NodeComponent>) {
    theNodeComponent.enable(...args)
  }

  function useTypeScript(...args: ArgsFromFactory<typeof TypeScriptComponent>) {
    theTypeScriptComponent.enable(...args)
  }

  function useVue(...args: ArgsFromFactory<typeof VueComponent>) {
    theVueComponent.enable(...args)
  }

  // Ensure these components are always enabled.
  theJavaScriptComponent.enable()
  theImportComponent.enable()
  thePromiseComponent.enable()
  thePrettierComponent.enable()

  return {
    // Extending lint
    registerComponent,
    getComponent,
    registerPackageManager,
    getPackageManager,
    findPackageManager,
    // Components
    extend,
    useNode,
    useTypeScript,
    useVue
  }
}

export function defineConfig(callback: (api: DefineConfigApi) => Linter.Config) {
  const isolate = useIsolate()
  const { logger, findPackageManager, getComponents } = isolate
  const api = useDefineConfigApi(isolate)
  const pm = findPackageManager()
  if (pm == null) {
    throw new ReferenceError('No package manager detected')
  }

  // Get the user configuration and create a separate
  // configuration object for the components to
  // fill. The user configuration will be
  // merged to override anything from
  // the component configuration.
  const userConfig = callback(api)
  let config: Linter.Config = {}

  const components = getComponents()
  for (const component of components) {
    if (component.enabled) {
      logger.debug(`Component "${component.name}" is enabled`)
    }
  }

  for (const component of components) {
    if (component.enabled) {
      logger.debug(`Running "${component.name}" pre-configure step`)
      component.preConfigure()
    }
  }

  const dependencies = new Array<string>()
  for (const component of components) {
    if (component.enabled) {
      logger.debug(`Checking dependencies for "${component.name}"`)
      dependencies.push(...component.dependencies.filter(dependency => !pm.has(dependency)))
    }
  }

  if (dependencies.length > 0) {
    logger.info(`Installing dependencies ${dependencies.map(dependency => `"${dependency}"`).join(', ')}`)
    pm.add(dependencies)

    logger.warn('You must re-run ESLint to use newly installed dependencies.')
    // eslint-disable-next-line n/no-process-exit -- Not an error, but cannot continue.
    process.exit(254)
  }

  for (const component of components) {
    if (component.enabled) {
      logger.debug(`Running "${component.name}" configure step`)
      config = component.configure(config)
    }
  }

  for (const component of components) {
    if (component.enabled) {
      logger.debug(`Running "${component.name}" post-configure step`)
      config = component.postConfigure(config)
    }
  }

  // Merge the user configuration onto the component
  // generated configuration.
  return merge(config, userConfig)
}
