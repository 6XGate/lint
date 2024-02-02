export type ValuesOf<Values> = Values extends readonly [unknown, ...unknown[]] ? Values[number] : never

export function isNotNullish<T>(value: T | null | undefined): value is T {
  return value != null
}
