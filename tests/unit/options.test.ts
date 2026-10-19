import { describe, expect, it } from "vitest"
import { parseOptions } from "../../src/options"

describe("parseOptions", () => {
  it("defaults to the sentence strategy", () => {
    expect(parseOptions({})).toEqual({ strategy: "sentence" })
  })

  it("accepts the apfel strategy", () => {
    expect(parseOptions({ strategy: "apfel" })).toEqual({ strategy: "apfel" })
  })

  it("rejects an unknown strategy", () => {
    expect(() => parseOptions({ strategy: "unknown" })).toThrow()
  })

  it("rejects a strategy that is not a name", () => {
    expect(() => parseOptions({ strategy: 0 })).toThrow()
  })
})
