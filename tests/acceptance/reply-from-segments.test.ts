import { describe, expect, it } from "vitest"
import { composeReply } from "../../src/compose"
import { nextIndex, prevIndex, toggleSelected } from "../../src/selection"
import { sentenceStrategy } from "../../src/strategies/sentence"
import { readFixture } from "../read-fixture"

const message = readFixture("acceptance-message.txt")

describe("reply from selected segments", () => {
  it("composes the reply that gets submitted", async () => {
    const segments = await sentenceStrategy(message)
    const first = nextIndex(-1, segments.length)
    const last = prevIndex(-1, segments.length)
    const selected = toggleSelected(toggleSelected([], last), first)
    expect(composeReply(message, segments, selected)).toBe(readFixture("acceptance-expected.txt"))
  })

  it("composes an empty reply after toggling the selected segment off", async () => {
    const segments = await sentenceStrategy(message)
    const first = nextIndex(-1, segments.length)
    const selected = toggleSelected(toggleSelected([], first), first)
    expect(composeReply(message, segments, selected)).toBe("")
  })
})
