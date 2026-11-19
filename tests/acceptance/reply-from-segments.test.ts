import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { composeReply } from "../../dist/core/compose.js"
import { nextIndex, prevIndex, toggleSelected } from "../../dist/core/selection.js"
import { regexStrategy } from "../../dist/strategies/index.js"

const readFixture = (name: string): string =>
  readFileSync(new URL(`../fixtures/${name}`, import.meta.url), "utf8")

const message = readFixture("standalone-message.txt")

await describe("reply from selected segments", async () => {
  await it("composes the reply that gets submitted", async () => {
    const segments = await regexStrategy(message)
    const first = nextIndex(-1, segments.length)
    const last = prevIndex(-1, segments.length)
    const selected = toggleSelected(toggleSelected([], last), first)
    assert.equal(composeReply(message, segments, selected), `${readFixture("acceptance-expected.txt").trimEnd()}\n\n\n`)
  })

  await it("composes an empty reply after toggling the selected segment off", async () => {
    const segments = await regexStrategy(message)
    const first = nextIndex(-1, segments.length)
    const selected = toggleSelected(toggleSelected([], first), first)
    assert.equal(composeReply(message, segments, selected), "")
  })
})
