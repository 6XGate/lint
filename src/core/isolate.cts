import pkgDir from 'pkg-dir'
import { useDependencySorter } from './dependency.cjs'
import useLogger from './logging.cjs'
import type { Component, ComponentFactory } from './components.cjs'
import type { Logger } from './logging.cjs'
import type { PackageManager, PackageManagerBindings, PackageManagerFactory } from './pm.cjs'

/* eslint-disable @typescript-eslint/no-explicit-any -- Needed to properly match everything. */

export type Isolate = ReturnType<typeof useIsolate>

export interface IsolateSettings {
  logger?: Logger | undefined
}

export function useIsolate(settings: IsolateSettings = {}) {
  const { logger = useLogger() } = settings

  const components = new Map<ComponentFactory<any, any>, Component<any>>()
  const packageManagers = new Map<PackageManagerFactory<any>, PackageManager<any>>()
  let defaultPackageManager: PackageManager<any> | undefined
  let packageManager: PackageManager<any> | undefined

  // Safeties
  let registering = false

  function registerComponent<Instance extends Component<any>>(factory: ComponentFactory<any, Instance>) {
    try {
      registering = true
      const instance = factory(isolate)
      components.set(factory, instance)

      return instance
    } finally {
      registering = false
    }
  }

  function getComponents() {
    const sorter = useDependencySorter<Component<any>>()
    for (const component of components.values()) {
      sorter.addBefore(component, component.before)
      sorter.addAfter(component, component.after)
    }

    return sorter.getItems()
  }

  function getComponent<Instance extends Component<any>>(factory: ComponentFactory<any, Instance>) {
    if (registering) {
      throw new SyntaxError('getComponent cannot be called during component setup')
    }

    const instance = components.get(factory)
    if (instance == null) {
      throw new ReferenceError(`"${factory.getComponentName()}" is not registered`)
    }

    return instance as Instance
  }

  function registerPackageManager<Bindings extends PackageManagerBindings>(
    factory: PackageManagerFactory<Bindings>,
    makeDefault = false
  ) {
    const instance = factory(isolate)
    packageManagers.set(factory, instance)

    if (makeDefault) {
      defaultPackageManager = instance
    }

    return instance
  }

  function getPackageManagers() {
    return Array.from(packageManagers.values())
  }

  function getPackageManager<Bindings extends PackageManagerBindings>(factory: PackageManagerFactory<Bindings>) {
    const instance = packageManagers.get(factory)
    if (instance == null) {
      throw new ReferenceError(`"${factory.getPackageManagerName()}" is not registered`)
    }
  }

  function findPackageManager() {
    if (packageManager != null) {
      return packageManager
    }

    const root = pkgDir.sync()
    if (root == null) {
      throw new ReferenceError('Must be used in an Node.js package or project')
    }

    for (const manager of packageManagers.values()) {
      if (manager.detect()) {
        packageManager = manager

        return manager
      }
    }

    return defaultPackageManager ?? null
  }

  const isolate = Object.freeze({
    logger,
    registerComponent,
    getComponents,
    getComponent,
    registerPackageManager,
    getPackageManagers,
    getPackageManager,
    findPackageManager
  })

  return isolate
}
