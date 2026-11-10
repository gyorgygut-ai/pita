import { describe, expect, it } from "vitest"
import { composeReply, quotedRanges } from "../../src/core/compose"
import type { Segment } from "../../src/core/segment"
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

describe("quotedRanges", () => {
  it("maps every quoted segment onto the reply", () => {
    expect(quotedRanges(fixture.expected)).toEqual([
      { start: 0, end: 6 },
      { start: 9, end: 17 },
    ])
  })

  it("returns no ranges for an empty reply", () => {
    expect(quotedRanges("")).toEqual([])
  })
})
