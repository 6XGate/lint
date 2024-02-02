import { definePackageManager } from '../core/pm.cjs'
import { run } from '../helpers/system.cjs'

const PerformantNodePackageManager = definePackageManager('pnpm', () => ({
  executables: ['pnpm', 'pnpm.cmd', 'pnpm.cjs'],
  lockFileNames: ['pnpm-lock.yaml'],
  add: names => {
    run('pnpm', 'add', '--save-dev', ...names)
  }
}))

export default PerformantNodePackageManager
