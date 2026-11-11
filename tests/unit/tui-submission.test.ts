import { describe, expect, it, vi } from "vitest"
import { assistantText, createOpenCodeSubmissionStrategy } from "../../src/hosts/opencode/tui"

describe("createOpenCodeSubmissionStrategy", () => {
  it("prompts the target session with submitted text", async () => {
    const prompt = vi.fn()
    await createOpenCodeSubmissionStrategy("session-1", prompt)("reply")
    expect(prompt).toHaveBeenCalledWith({ sessionID: "session-1", text: "reply" })
  })
})

describe("assistantText", () => {
  it("preserves formatting while joining text parts", () => {
    const content = [
      { type: "text", text: "**Bold heading**\n\n" },
      { type: "image" },
      { type: "text", text: "- first item\n- second item" },
    ]

    expect(assistantText(content)).toBe("**Bold heading**\n\n- first item\n- second item")
  })
})
