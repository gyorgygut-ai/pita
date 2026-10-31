import { describe, expect, it, vi } from "vitest"
import { createOpenCodeSubmissionStrategy } from "../../src/tui"

describe("createOpenCodeSubmissionStrategy", () => {
  it("prompts the target session with submitted text", async () => {
    const prompt = vi.fn()
    await createOpenCodeSubmissionStrategy("session-1", prompt)("reply")
    expect(prompt).toHaveBeenCalledWith({ sessionID: "session-1", text: "reply" })
  })
})
