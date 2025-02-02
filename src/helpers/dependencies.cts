import { unique } from 'radash'

export function defineDependencies(dependencies: Record<string, boolean | (() => boolean)>) {
  const list = new Array<string>()

  for (const [dependency, enable] of Object.entries(dependencies)) {
    if (enable === true) {
      list.push(dependency)
    } else if (typeof enable === 'function' && enable()) {
      list.push(dependency)
    }
  }

  return unique(list)
}
