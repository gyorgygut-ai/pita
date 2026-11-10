import { describe, expect, it, vi } from "vitest"
import { apfelArgs, createApfel } from "../../src/hosts/opencode/apfel"
import type { Exec } from "../../src/hosts/opencode/apfel"

describe("apfelArgs", () => {
  it("asks apfel for json output without color", () => {
    expect(apfelArgs("split this")).toEqual(["--output", "json", "--no-color", "split this"])
  })
})

describe("createApfel", () => {
  it("runs the apfel cli with the prompt", async () => {
    const exec = vi.fn<Exec>(async () => "{}")
    await createApfel(exec)("split this")
    expect(exec).toHaveBeenCalledWith("apfel", ["--output", "json", "--no-color", "split this"])
  })

  it("returns the cli stdout", async () => {
    const exec: Exec = async () => '{"content":"Keep this."}'
    expect(await createApfel(exec)("split this")).toBe('{"content":"Keep this."}')
  })
})
