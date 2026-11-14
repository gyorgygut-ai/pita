import { describe, expect, it } from "vitest"
import { parseOptions } from "../../src/config/options"

describe("parseOptions", () => {
  it("defaults to the regex strategy", () => {
    expect(parseOptions({})).toEqual({ strategy: "regex", keybind: "<leader>p" })
  })

  it("rejects the removed apfel strategy", () => {
    expect(() => parseOptions({ strategy: "apfel" })).toThrow('unknown strategy: "apfel"')
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
