import { describe, expect, it } from "vitest"
import {
  apfelStrategy,
  mapDecision,
  parseApfelOutput,
  segmentPrompt,
} from "../../src/strategies/llm-apfel"
import type { ApfelRunner } from "../../src/strategies/llm-apfel"
import { readFixture } from "../read-fixture"

const message = readFixture("apfel-message.txt")

const runner: ApfelRunner = async () => readFixture("apfel-output.json")

describe("parseApfelOutput", () => {
  it("reads the model content out of the apfel envelope", () => {
    expect(parseApfelOutput(readFixture("apfel-output.json"))).toBe(readFixture("decision.txt"))
  })
})

describe("mapDecision", () => {
  it("maps the quoted lines onto the message", () => {
    expect(mapDecision(message, readFixture("decision.txt"))).toEqual([
      { start: 0, end: 10 },
      { start: 22, end: 36 },
    ])
  })

  it("maps an empty decision to no segments", () => {
    expect(mapDecision(message, "")).toEqual([])
  })

  it("maps a decision that does not quote the message to no segments", () => {
    expect(mapDecision(message, readFixture("garbage.txt"))).toEqual([])
  })
})

describe("segmentPrompt", () => {
  it("carries the message", () => {
    expect(segmentPrompt(message)).toContain(message)
  })
})

describe("apfelStrategy", () => {
  it("segments the message through the runner", async () => {
    expect(await apfelStrategy(runner)(message)).toEqual([
      { start: 0, end: 10 },
      { start: 22, end: 36 },
    ])
  })
})
