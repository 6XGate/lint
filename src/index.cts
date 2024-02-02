export { default as JavaScriptComponent } from './components/javascript.cjs'
export { default as ImportComponent } from './components/import.cjs'
export { default as NodeComponent } from './components/node.cjs'
export { default as PromiseComponent } from './components/promise.cjs'
export { default as TypeScriptComponent } from './components/typescript.cjs'
export { default as VueComponent } from './components/vue.cjs'
export { default as PrettierComponent } from './components/prettier.cjs'
export { default as ExtendComponent } from './components/extend.cjs'
export type {
  Component,
  ComponentSetupContext,
  ComponentFactory,
  BasicComponentBindings,
  ConfigurableComponentBindings
} from './core/components.cjs'
export type {
  PackageManager,
  PackageManagerSetupContext,
  PackageManagerFactory,
  PackageManagerBindings
} from './core/pm.cjs'
export { definePackageManager } from './core/pm.cjs'
export { defineComponent } from './core/components.cjs'
export { defineConfig } from './core/system.cjs'
