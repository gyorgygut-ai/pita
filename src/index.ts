import { execFile } from "node:child_process"
import { promisify } from "node:util"
import type { ApfelRunner } from "./strategies/llm-apfel"

const exec = promisify(execFile)

export const apfel: ApfelRunner = async (prompt) => {
  const result = await exec("apfel", ["-o", "json", prompt])
  return result.stdout
}
