import { describe, expect, it } from "vitest"
import { splitSentences } from "../../src/strategies/sentence"
import { readFixture } from "../read-fixture"

const slices = (message: string): string[] =>
  splitSentences(message).map((segment) => message.slice(segment.start, segment.end))

describe("splitSentences", () => {
  it("returns no segments for an empty message", () => {
    expect(splitSentences("")).toEqual([])
  })

  it("returns no segments for a message without sentences", () => {
    expect(splitSentences(readFixture("empty.txt"))).toEqual([])
  })

  it("returns no segments for whitespace only", () => {
    expect(splitSentences("\n   \n")).toEqual([])
  })

  it("splits a simple message into sentences", () => {
    expect(splitSentences(readFixture("simple.txt"))).toEqual([
      { start: 0, end: 12 },
      { start: 13, end: 25 },
      { start: 26, end: 36 },
    ])
  })

  it("splits a complex message into the sentences it contains", () => {
    expect(slices(readFixture("complex.txt"))).toEqual([
      "# Findings",
      "First point.",
      "Second point...",
      "Then a third?",
      "- bullet one",
      "- bullet two",
    ])
  })

  it("starts the first segment on the first character of the message", () => {
    expect(splitSentences(readFixture("complex.txt"))[0]).toEqual({ start: 0, end: 10 })
  })
})
