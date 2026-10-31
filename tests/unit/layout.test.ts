import { describe, expect, it } from "vitest"
import { layoutRuns } from "../../src/layout"
import type { Segment } from "../../src/segment"

const message = "Alpha.\n\nBeta.\nGamma."
const segments: readonly Segment[] = [
  { start: 0, end: 6 },
  { start: 8, end: 13 },
  { start: 14, end: 20 },
]

describe("layoutRuns", () => {
  it("rebuilds the message byte for byte", () => {
    expect(layoutRuns(message, segments).map((run) => run.text).join("")).toBe(message)
  })

  it("keeps the blank line between segments as a gap", () => {
    expect(layoutRuns(message, segments).map((run) => run.segment)).toEqual([0, null, 1, null, 2])
  })

  it("maps each run onto its segment text", () => {
    const runs = layoutRuns(message, segments)
    expect(runs[0].text).toBe("Alpha.")
    expect(runs[2].text).toBe("Beta.")
    expect(runs[4].text).toBe("Gamma.")
  })

  it("keeps leading and trailing text outside the segments", () => {
    expect(layoutRuns("  Alpha.  ", [{ start: 2, end: 8 }])).toEqual([
      { text: "  ", segment: null },
      { text: "Alpha.", segment: 0 },
      { text: "  ", segment: null },
    ])
  })
})
