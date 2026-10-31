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

  it("splits a complex message on sentence terminators", () => {
    expect(slices(readFixture("complex.txt"))).toEqual([
      "# Findings\n\nFirst point.",
      "Second point...",
      "Then a third?",
      "- bullet one\n- bullet two",
    ])
  })

  it("keeps a newline inside a sentence", () => {
    const message = "First line\nsecond line. Next."
    expect(slices(message)).toEqual(["First line\nsecond line.", "Next."])
  })

  it("keeps a trailing block without a terminator as its own segment", () => {
    expect(slices("Intro. Outro")).toEqual(["Intro.", "Outro"])
  })

  it("does not treat a numbered list marker as a sentence end", () => {
    expect(slices("Pick one.\n1. Explorer\n2. Cozy\nDone.")).toEqual([
      "Pick one.",
      "1. Explorer\n2. Cozy\nDone.",
    ])
  })

  it("starts the first segment on the first character of the message", () => {
    expect(splitSentences(readFixture("complex.txt"))[0]).toEqual({ start: 0, end: 24 })
  })
})
