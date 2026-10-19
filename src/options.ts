import type { StrategyName } from "./strategies"

export type PitaOptions = {
  readonly strategy: StrategyName
}

export type ParseOptions = (options: Readonly<Record<string, unknown>>) => PitaOptions

const isStrategyName = (value: unknown): value is StrategyName => {
  switch (value) {
    case "sentence":
    case "apfel":
      return true
    default:
      return false
  }
}

export const parseOptions: ParseOptions = (options) => {
  const strategy = options.strategy ?? "sentence"
  if (!isStrategyName(strategy)) {
    throw new Error(`unknown strategy: ${JSON.stringify(strategy)}`)
  }
  return { strategy }
}
