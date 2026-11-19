import { describe, expect, it } from "vitest"
import { readFileSync } from "node:fs"
import { regexStrategy } from "../../src/strategies/regex"

describe("regexStrategy", () => {
  it("separates an emoji heading from following prose", async () => {
    const segments = await regexStrategy("📋 TL;DR\nYou've got options.")
    expect(segments.map(({ start, end }) => [start, end])).toEqual([[0, 8], [9, 28]])
  })

  it("returns ordered ranges around paragraph whitespace", async () => {
    const segments = await regexStrategy("First.\n\nSecond.")
    expect(segments).toEqual([{ start: 0, end: 6 }, { start: 8, end: 15 }])
  })

  it("segments every prose sentence regardless of paragraph length and skips blank lines", async () => {
    const message = "Short. Still short.\n\nA longer sentence continues past the former size cutoff by repeating meaningful words many times and remains one complete sentence without a period until here. Next sentence."
    const segments = await regexStrategy(message)

    expect(segments).toEqual([{ start: 0, end: 6 }, { start: 7, end: 19 }, { start: 21, end: 180 }, { start: 181, end: 195 }])
  })

  it("keeps visible markdown structures as whole segments without blank lines", async () => {
    const message = "# Heading\n\n- first item\n- second item\n\n> quoted text\n\n```ts\nconst value = 1\n```\n\n---"
    const segments = await regexStrategy(message)

    expect(segments).toEqual([{ start: 0, end: 9 }, { start: 11, end: 23 }, { start: 24, end: 37 }, { start: 39, end: 52 }, { start: 54, end: 79 }, { start: 81, end: 84 }])
  })

  it("segments list items, headings, and prose sentences inside the supplied Markdown fixture", async () => {
    const message = readFileSync(new URL("../fixtures/fenced-opencode-message.md", import.meta.url), "utf8").trimEnd()
    const segments = await regexStrategy(message)
    const text = segments.map(({ start, end }) => message.slice(start, end).trim())

    expect(text).toEqual(expect.arrayContaining([
      "1. **Runtime:** Node.js 26 with TypeScript for a fast, predictable development loop.",
      "2. **UI:** React with a small set of reusable components, keeping the feature easy to iterate on.",
      "5. **Delivery:** Ship behind a feature flag so we can learn from real usage before a full rollout.",
      "# Vibe Coding a Feature ✨",
      "## The spark 💡",
      "It starts with a tiny annoyance: there’s one extra step between having an idea and seeing it work.",
      "Nothing dramatic—just enough friction to interrupt the flow.",
      "## Finding the shape 🧭",
    ]))
    expect(segments.every(({ start, end }) => start >= 0 && start < end && end <= message.length)).toBe(true)
  })

  it("starts prose after a list as sentence segments", async () => {
    const message = "- item\nA regular sentence.\nAnother sentence."
    const segments = await regexStrategy(message)

    expect(segments).toEqual([{ start: 0, end: 6 }, { start: 7, end: 26 }, { start: 27, end: 44 }])
  })
})
