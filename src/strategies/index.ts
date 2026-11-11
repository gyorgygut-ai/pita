import type { Segment } from "../core/segment.js"
import { apfelStrategy, type ApfelRunner } from "./llm-apfel.js"
import { regexStrategy } from "./regex.js"

export type StrategyName = "apfel" | "regex"

export type Strategy = (message: string) => Promise<Segment[]>

export type StrategyDeps = {
  readonly runApfel: ApfelRunner
}

export type ResolveStrategy = (name: StrategyName, deps: StrategyDeps) => Strategy

export const resolveStrategy: ResolveStrategy = (name, deps) => {
  if (name === "apfel") {
    return apfelStrategy(deps.runApfel)
  }
  return regexStrategy
}

export { regexStrategy }