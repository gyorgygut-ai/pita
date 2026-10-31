import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { composeReply } from "../../dist/compose.js"
import { toggleSelected } from "../../dist/selection.js"
import { resolveStrategy } from "../../dist/strategies/index.js"

const readFixture = (name: string): string =>
  readFileSync(new URL(`../fixtures/${name}`, import.meta.url), "utf8")

const message = readFixture("apfel-message.txt")

const runner = async (): Promise<string> => readFixture("apfel-output.json")

await describe("reply from apfel segments", async () => {
  await it("composes the reply that gets submitted", async () => {
    const strategy = resolveStrategy("apfel", { runApfel: runner })
    const segments = await strategy(message)
    const selected = toggleSelected(toggleSelected([], 0), 1)
    assert.equal(composeReply(message, segments, selected), readFixture("apfel-expected.txt"))
  })
})
