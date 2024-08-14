import { definePackageManager } from '../core/pm.cjs'
import { run } from '../helpers/system.cjs'

const YarnPackageManager = definePackageManager('yarn', () => ({
  executables: ['yarn', 'yarn.cmd', 'yarn.js'],
  lockFileNames: ['yarn.lock'],
  add: (names) => {
    run('yarn', 'add', '--dev', ...names)
  }
}))

export default YarnPackageManager
