import type { Segment } from "../segment"
import type { ApfelRunner } from "./llm-apfel"

export type StrategyName = "sentence" | "apfel"

export type Strategy = (message: string) => Promise<Segment[]>

export type StrategyDeps = {
  readonly runApfel: ApfelRunner
}

export type ResolveStrategy = (name: StrategyName, deps: StrategyDeps) => Strategy

export const resolveStrategy: ResolveStrategy = () => {
  throw new Error("not implemented")
}
