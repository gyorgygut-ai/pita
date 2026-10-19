import { describe, expect, it } from "vitest"
import { composeReply } from "../../src/compose"
import { toggleSelected } from "../../src/selection"
import { resolveStrategy } from "../../src/strategies"
import type { ApfelRunner } from "../../src/strategies/llm-apfel"
import { readFixture } from "../read-fixture"

const message = readFixture("apfel-message.txt")

const runner: ApfelRunner = async () => readFixture("apfel-output.json")

describe("reply from apfel segments", () => {
  it("composes the reply that gets submitted", async () => {
    const strategy = resolveStrategy("apfel", { runApfel: runner })
    const segments = await strategy(message)
    const selected = toggleSelected(toggleSelected([], 0), 1)
    expect(composeReply(message, segments, selected)).toBe(readFixture("apfel-expected.txt"))
  })
})
