import type { Segment } from "../core/segment.js"
import { regexStrategy } from "./regex.js"

export type StrategyName = "regex"

export type Strategy = (message: string) => Promise<Segment[]>

export type ResolveStrategy = (name: StrategyName) => Strategy

export const resolveStrategy: ResolveStrategy = () => regexStrategy

export { regexStrategy }
