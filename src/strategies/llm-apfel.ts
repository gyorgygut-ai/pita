import type { Strategy } from "./index"

export type ApfelRunner = (prompt: string) => Promise<string>

export type ApfelStrategy = (runApfel: ApfelRunner) => Strategy

export const apfelStrategy: ApfelStrategy = () => {
  throw new Error("not implemented")
}
