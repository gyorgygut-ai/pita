import { describe, expect, it } from "vitest"
import { createSelectedSyntaxStyle } from "../../src/ui/screens.js"

describe("createSelectedSyntaxStyle", () => {
  it("uses the legacy factory signature when the renderer has no native scene", () => {
    expect(() =>
      createSelectedSyntaxStyle({}, { selected: {} }, (...args) => {
        throw new Error(JSON.stringify(args))
      }),
    ).toThrow(JSON.stringify([{ selected: {} }]))
  })
})
