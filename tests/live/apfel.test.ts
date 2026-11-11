import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { test } from "node:test"
import { apfel } from "../../dist/hosts/opencode/apfel.js"
import { resolveStrategy } from "../../dist/strategies/index.js"

const message = readFileSync(new URL("../fixtures/apfel-message.txt", import.meta.url), "utf8").trimEnd()
const segment = resolveStrategy("apfel", { runApfel: apfel })

await test("Apfel returns usable source segments", async () => {
  const segments = await segment(message)
  assert.equal(segments.length, 2)
  assert.ok(segments.every(({ start, end }) => end > start && message.slice(start, end).length > 0))
})