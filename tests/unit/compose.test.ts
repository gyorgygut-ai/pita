import { describe, expect, it } from "vitest"
import { composeReply } from "../../src/compose"
import type { Segment } from "../../src/segment"
import { readFixture } from "../read-fixture"

const fixture: {
  message: string
  segments: readonly Segment[]
  selected: readonly number[]
  expected: string
} = JSON.parse(readFixture("compose.json"))

describe("composeReply", () => {
  it("quotes the selected segments with two blank lines between them", () => {
    expect(composeReply(fixture.message, fixture.segments, fixture.selected)).toBe(fixture.expected)
  })

  it("quotes a single selected segment", () => {
    expect(composeReply(fixture.message, fixture.segments, [1])).toBe('"Two."')
  })

  it("returns an empty reply when no segment is selected", () => {
    expect(composeReply(fixture.message, fixture.segments, [])).toBe("")
  })
})
