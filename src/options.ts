import type { StrategyName } from "./strategies"

export type PitaOptions = {
  readonly strategy: StrategyName
}

export type ParseOptions = (options: Readonly<Record<string, unknown>>) => PitaOptions

export const parseOptions: ParseOptions = () => {
  throw new Error("not implemented")
}
