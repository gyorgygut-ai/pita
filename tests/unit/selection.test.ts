import { describe, expect, it } from "vitest"
import { isSelected, nextIndex, prevIndex, toggleSelected } from "../../src/selection"
import { readFixture } from "../read-fixture"

type IndexCase = { current: number; count: number; expected: number }
type ToggleCase = { selected: readonly number[]; index: number; expected: readonly number[] }

const cases: {
  next: IndexCase[]
  prev: IndexCase[]
  toggle: ToggleCase[]
} = JSON.parse(readFixture("selection.json"))

describe("nextIndex", () => {
  it("moves the highlight to the following segment and wraps around", () => {
    for (const testCase of cases.next) {
      expect(nextIndex(testCase.current, testCase.count)).toBe(testCase.expected)
    }
  })
})

describe("prevIndex", () => {
  it("moves the highlight to the previous segment and wraps around", () => {
    for (const testCase of cases.prev) {
      expect(prevIndex(testCase.current, testCase.count)).toBe(testCase.expected)
    }
  })
})

describe("toggleSelected", () => {
  it("adds and removes the index in ascending order", () => {
    for (const testCase of cases.toggle) {
      expect(toggleSelected(testCase.selected, testCase.index)).toEqual(testCase.expected)
    }
  })
})

describe("isSelected", () => {
  it("reports a picked index", () => {
    expect(isSelected([0, 2], 2)).toBe(true)
  })

  it("reports an unpicked index", () => {
    expect(isSelected([0, 2], 1)).toBe(false)
  })
})
