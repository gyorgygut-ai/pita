import { describe, expect, it, vi } from "vitest"
import {
  assistantText,
  createOpenCodeReturnToChat,
  createOpenCodeSubmissionStrategy,
} from "../../src/hosts/opencode/tui"

describe("createOpenCodeSubmissionStrategy", () => {
  it("prompts the target session with submitted text", async () => {
    const prompt = vi.fn()
    await createOpenCodeSubmissionStrategy("session-1", prompt, vi.fn())("reply")
    expect(prompt).toHaveBeenCalledWith({ sessionID: "session-1", text: "reply" })
  })

  it("returns to the session after the prompt resolves", async () => {
    const events: string[] = []
    const prompt = vi.fn(async () => {
      events.push("prompt")
    })
    const onSubmitted = vi.fn(() => {
      events.push("return")
    })

    await createOpenCodeSubmissionStrategy("session-1", prompt, onSubmitted)("reply")

    expect(prompt).toHaveBeenCalledWith({ sessionID: "session-1", text: "reply" })
    expect(events).toEqual(["prompt", "return"])
    expect(onSubmitted).toHaveBeenCalledOnce()
  })
})

describe("createOpenCodeReturnToChat", () => {
  it("navigates to the session and scrolls to its last message", () => {
    const events: string[] = []
    const returnToChat = createOpenCodeReturnToChat(
      () => events.push("session"),
      (commandID) => events.push(commandID),
    )

    returnToChat()

    expect(events).toEqual(["session", "session.last"])
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
