import { describe, expect, it } from "vitest"
import type { SyntaxStyle } from "@opentui/core"
import { createSelectedSyntaxStyle } from "../../src/ui/screens.js"

describe("createSelectedSyntaxStyle", () => {
  it("uses the legacy factory signature when the renderer has no native scene", () => {
    const calls: unknown[][] = []
    const style = {} as SyntaxStyle

    createSelectedSyntaxStyle(
      {},
      { selected: {} },
      (...args) => {
        calls.push(args)
        return style
      },
    )

    expect(calls).toEqual([[{ selected: {} }]])
  })
})
