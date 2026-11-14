import { describe, it } from "node:test"
import assert from "node:assert/strict"
import type { CliRenderer } from "@opentui/core"
import { createTestRenderer } from "@opentui/core/testing"
import { createSelectedSyntaxStyle } from "../../dist/ui/screens.js"

const capturedStyleOwner = (renderer: CliRenderer): unknown => {
  let owner: unknown
  assert.throws(() => createSelectedSyntaxStyle(renderer, {}, (_styles, value) => { owner = value; throw new Error("captured") }), /captured/)
  return owner
}

await describe("selected syntax style", async () => {
  await it("uses the renderer native scene as the style owner", async () => {
    const setup = await createTestRenderer({ width: 40, height: 10 })
    try {
      assert.equal(capturedStyleOwner(setup.renderer), setup.renderer.nativeScene)
    } finally {
      setup.renderer.destroy()
    }
  })
})
