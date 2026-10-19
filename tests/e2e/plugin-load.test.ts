import { describe, expect, it } from "vitest"
import { execFileSync } from "node:child_process"

describe("plugin wiring", () => {
  it("loads in opencode without error", () => {
    let output: string
    try {
      output = execFileSync(
        "opencode",
        ["run", "hi"],
        { cwd: process.env.HOME, encoding: "utf8", timeout: 10000 }
      )
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      // Model unavailable / insufficient balance → skip, not a plugin-wiring failure
      if (/insufficient balance|model unavailable|no.*model|credits/i.test(message)) {
        // Skip this test since we can't verify plugin wiring without a model
        return
      }
      throw error
    }
    expect(output).toContain("Hi")
  })
})