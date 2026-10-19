import { readFileSync } from "node:fs"
import { join } from "node:path"

export type ReadFixture = (name: string) => string

export const readFixture: ReadFixture = (name) =>
  readFileSync(join(import.meta.dirname, "fixtures", name), "utf8")
