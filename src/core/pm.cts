import { statSync as stat } from 'node:fs'
import { resolve as resolvePath } from 'node:path'
import pkgDir from 'pkg-dir'
import readPkg from 'read-pkg'
import type { Isolate } from './isolate.cjs'

export interface PackageManagerBindings {
  /** Known package manager exeuctables */
  executables: [string, ...string[]]
  /** Known lock file names. */
  lockFileNames: [string, ...string[]]
  /** Extra custom detection logic. */
  detect?: () => boolean
  /** Indicates whether the package is installed */
  has?: (name: string) => boolean
  /** Installs a package. */
  add: (names: string[]) => void
}

export type PackageManagerFactory<Bindings extends PackageManagerBindings> = ReturnType<
  typeof definePackageManager<Bindings>
>

export type PackageManager<Bindings extends PackageManagerBindings> = ReturnType<PackageManagerFactory<Bindings>>

export type PackageManagerSetupContext = ReturnType<typeof makeSetupContext>
function makeSetupContext(isolate: Isolate) {
  const { logger, getPackageManager } = isolate

  return {
    get logger() {
      return logger
    },
    getPackageManager
  }
}

type PackageJson = ReturnType<typeof readPkg.sync>

export function definePackageManager<Bindings extends PackageManagerBindings>(
  name: string,
  setup: (context: PackageManagerSetupContext) => Bindings
) {
  return Object.assign(
    (isolate: Isolate) => {
      const { logger } = isolate
      const { lockFileNames, executables, detect, has, add, ...bindings } = setup(makeSetupContext(isolate))

      const cwd = pkgDir.sync()
      if (cwd == null) {
        throw new ReferenceError('Must be used in an Node.js package or project')
      }

      const detectByPackageInfo = (info: PackageJson) => {
        logger.debug(`Looking for "${name}" package manager in package.json`)
        const specified = info['packageManager']
        if (typeof specified !== 'string') {
          return false
        }

        const [managerName] = specified.split('@')
        if (managerName !== name) {
          return false
        }

        return true
      }

      const detectByLockFile = () => {
        logger.debug(`Looking for "${name}" package manager by lock file`)
        for (const lockFileName of lockFileNames) {
          const expectedLockFilePath = resolvePath(cwd, lockFileName)
          const exists = stat(expectedLockFilePath, { throwIfNoEntry: false })?.isFile() ?? false
          if (exists) {
            return true
          }
        }

        return false
      }

      const detectByExecutable = () => {
        const executable = process.env['npm_execpath']
        if (executable == null) {
          logger.debug(`Looking for "${name}" package manager by npm npm_execpath: not found`)
          return false
        }

        logger.debug(`Looking for "${name}" package manager by npm npm_execpath: is ${executable}`)
        for (const possible of executables) {
          if (executable.endsWith(possible)) {
            return true
          }
        }

        return false
      }

      const lookForPackageManager = () => {
        logger.debug(`Looking for "${name}" package manager by custom logic`)
        const detected = detect?.() ?? false
        if (detected) {
          return true
        }

        if (detectByExecutable()) {
          return true
        }

        const info = readPkg.sync({ cwd })
        if (detectByPackageInfo(info)) {
          return true
        }

        if (detectByLockFile()) {
          return true
        }

        return false
      }

      const detectPackageManager = () => {
        if (lookForPackageManager()) {
          logger.debug(`Using "${name}" for package manager`)
          logger.debug(`Package root: ${cwd}`)

          return true
        }

        return false
      }

      const isInstalled = (dependency: string) => {
        if (has != null) {
          return has(dependency)
        }

        try {
          // The package must be installed.
          logger.debug(`    is "${dependency}" installed`)
          require.resolve(dependency)
          const info = readPkg.sync({ cwd })

          // The package must be installed at the top-level.
          logger.debug(`    is "${dependency}" top-level`)
          return info.dependencies?.[dependency] != null || info.devDependencies?.[dependency] != null
        } catch {
          return false
        }
      }

      const hasDependency = (dependency: string) => {
        logger.debug(`  requires "${dependency}"`)
        if (isInstalled(dependency)) {
          logger.debug(`    "${dependency}" is installed`)

          return true
        }

        return false
      }

      return {
        get name() {
          return name
        },
        get executables() {
          return [...executables]
        },
        get lockFileNames() {
          return [...lockFileNames]
        },
        detect: detectPackageManager,
        has: hasDependency,
        add,
        ...bindings
      }
    },
    {
      getPackageManagerName: () => name
    }
  )
}
