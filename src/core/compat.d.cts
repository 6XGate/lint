import type { Linter } from 'eslint'

export interface FlatCompat {
  config(config: Linter.Config): Linter.FlatConfig[]
  env(env: Required<Linter.Config>['env']): Linter.FlatConfig[]
  extends(...names: string[]): Linter.FlatConfig[]
  plugins(...plugins: string[]): Linter.FlatConfig[]
}

declare const useFlatCompat: () => FlatCompat

export default useFlatCompat
