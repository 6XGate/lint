import { definePackageManager } from '../core/pm.cjs'
import { run } from '../helpers/system.cjs'

const NodePackageManager = definePackageManager('npm', () => ({
  executables: ['npm', 'npm.js', 'npm.cmd', 'npm.ps1', 'npm-cli.js'],
  lockFileNames: ['package-lock.json', 'npm-shrinkwrap.json'],
  add: names => {
    run('npm', 'install', '--save-dev', '--legacy-peer-deps', ...names)
  }
}))

export default NodePackageManager
