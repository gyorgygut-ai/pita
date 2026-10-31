import { execFile } from "node:child_process"
import { promisify } from "node:util"
import type { ApfelRunner } from "./strategies/llm-apfel.js"

export type Exec = (file: string, args: readonly string[]) => Promise<string>

export const apfelArgs = (prompt: string): string[] => ["--output", "json", "--no-color", prompt]

export const createApfel = (exec: Exec): ApfelRunner => (prompt) =>
  exec("apfel", apfelArgs(prompt))

const run: Exec = async (file, args) => {
  const result = await promisify(execFile)(file, [...args])
  return result.stdout
}

export const apfel = createApfel(run)
