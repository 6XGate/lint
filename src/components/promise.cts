import { defineComponent } from '../core/components.cjs'
import ExtendComponent from './extend.cjs'

const PromiseComponent = defineComponent('promise', ({ getComponent }) => {
  function enable() {
    getComponent(ExtendComponent).enable()
  }

  function getDependencies() {
    return ['eslint-plugin-promise']
  }

  function preConfigure() {
    getComponent(ExtendComponent).extend('plugin:promise/recommended')
  }

  return {
    enable,
    getDependencies,
    preConfigure
  }
})

export default PromiseComponent
