import type { Segment } from "../segment"
import { apfelStrategy, type ApfelRunner } from "./llm-apfel"
import { sentenceStrategy } from "./sentence"

export type StrategyName = "sentence" | "apfel"

export type Strategy = (message: string) => Promise<Segment[]>

export type StrategyDeps = {
  readonly runApfel: ApfelRunner
}

export type ResolveStrategy = (name: StrategyName, deps: StrategyDeps) => Strategy

export const resolveStrategy: ResolveStrategy = (name, deps) => {
  if (name === "apfel") {
    return apfelStrategy(deps.runApfel)
  }
  return sentenceStrategy
}
