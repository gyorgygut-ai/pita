import { describe, expect, it } from "vitest"
import { regexStrategy } from "../../src/strategies/regex"

describe("regexStrategy", () => {
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

  it("starts prose after a list as sentence segments", async () => {
    const message = "- item\nA regular sentence.\nAnother sentence."
    const segments = await regexStrategy(message)

    expect(segments).toEqual([{ start: 0, end: 6 }, { start: 7, end: 26 }, { start: 27, end: 44 }])
  })
})
