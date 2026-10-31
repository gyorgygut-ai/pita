import { describe, expect, it } from "vitest"
import { parseOptions } from "../../src/options"

describe("parseOptions", () => {
  it("defaults to the sentence strategy", () => {
    expect(parseOptions({})).toEqual({ strategy: "sentence", keybind: "<leader>p" })
  })

  it("accepts the apfel strategy", () => {
    expect(parseOptions({ strategy: "apfel" })).toEqual({ strategy: "apfel", keybind: "<leader>p" })
  })

  it("accepts a configured keybind", () => {
    expect(parseOptions({ keybind: "ctrl+shift+p" }).keybind).toBe("ctrl+shift+p")
  })

  it("rejects an empty keybind", () => {
    expect(() => parseOptions({ keybind: "" })).toThrow()
  })

  it("rejects a keybind that is not a string", () => {
    expect(() => parseOptions({ keybind: 0 })).toThrow()
  })

  it("rejects an unknown strategy", () => {
    expect(() => parseOptions({ strategy: "unknown" })).toThrow()
  })

  it("rejects a strategy that is not a name", () => {
    expect(() => parseOptions({ strategy: 0 })).toThrow()
  })
})
