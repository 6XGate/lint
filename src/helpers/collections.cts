export class MappedSets<K, V> extends Map<K, Set<V>> {
  override get(key: K) {
    let set = super.get(key)
    if (set == null) {
      super.set(key, (set = new Set<V>()))
    }

    return set
  }

  add(key: K, ...values: V[]) {
    const set = this.get(key)
    for (const value of values) {
      set.add(value)
    }
  }

  try(key: K) {
    return super.get(key)
  }
}

export function asArray<T>(value: T | T[] | Iterable<T>) {
  if (value == null) {
    return []
  }

  if (Array.isArray(value)) {
    return value
  }

  if (typeof value === 'object' && Symbol.iterator in value) {
    return [...value]
  }

  return [value]
}

type MapPredicate<T, R> = (value: T, index: number, array: T[]) => R
export function mapIterable<T, R>(iterable: Iterable<T>, predicate: MapPredicate<T, R>) {
  return Array.from(iterable).map(predicate)
}

type ReducePredicate<T, U> = (previousValue: U, currentValue: T, index: number, array: T[]) => U
export function reduceIterable<T>(iterable: Iterable<T>, predicate: ReducePredicate<T, T>): T
export function reduceIterable<T>(iterable: Iterable<T>, predicate: ReducePredicate<T, T>, intial: T): T
export function reduceIterable<T, U>(iterable: Iterable<T>, predicate: ReducePredicate<T, U>, initial: U): U
export function reduceIterable<T, U>(iterable: Iterable<T>, predicate: ReducePredicate<T, U>, initial?: U | undefined) {
  // eslint-disable-next-line @typescript-eslint/prefer-reduce-type-parameter -- Will not compile otherwise.
  return Array.from(iterable).reduce(predicate, initial as U)
}
