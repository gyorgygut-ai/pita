import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { createComponent } from "solid-js"
import { testRender } from "@opentui/solid"
import type { TestRendererSetup } from "@opentui/core/testing"
import type { Segment } from "../../src/core/segment.js"
import { StandaloneApp, standaloneMessage, standalonePalette } from "../../dist/hosts/standalone/standalone.js"

const message = "Alpha.\n\nBeta.\nGamma."
const fixture = readFileSync(new URL("../fixtures/standalone-message.txt", import.meta.url), "utf8")
const segments: readonly Segment[] = [
  { start: 0, end: 6 },
  { start: 8, end: 13 },
  { start: 14, end: 20 },
]

type HarnessProps = {
  readonly onClose?: () => void
}

const mount = (props: HarnessProps): Promise<TestRendererSetup> =>
  testRender(() => createComponent(StandaloneApp, { message, segments, ...props }), {
    width: 40,
    height: 14,
  })

const settle = async (setup: TestRendererSetup): Promise<void> => {
  setup.renderer.requestRender()
  await setup.flush()
  await setup.renderOnce()
  await setup.flush()
}

const lines = (setup: TestRendererSetup): string[] =>
  setup
    .captureCharFrame()
    .split("\n")
    .map((line) => line.replace(/^│\s?/, "").replace(/\s*│$/, "").trim())

const span = (setup: TestRendererSetup, text: string) =>
  setup.captureSpans().lines.flatMap((line) => line.spans).find((item) => item.text.includes(text))

const anchor = (setup: TestRendererSetup, text: string): number =>
  lines(setup).findIndex((line) => line === text)

type InputAction = "down" | "up" | "space" | "enter" | "escape"

const act = async (setup: TestRendererSetup, actions: readonly InputAction[]): Promise<void> => {
  await setup.flush()
  for (const action of actions) {
    if (action === "down" || action === "up") {
      setup.mockInput.pressArrow(action)
    }
    if (action === "space") {
      setup.mockInput.pressKey(" ")
    }
    if (action === "enter") {
      setup.mockInput.pressEnter()
    }
    if (action === "escape") {
      await setup.mockInput.pressKeys(["\u001B"], 100)
    }
  }
  await settle(setup)
}

const submitEditedReply = async (setup: TestRendererSetup): Promise<void> => {
  await act(setup, ["down", "space", "enter"])
  await setup.mockInput.typeText("X")
  await settle(setup)
  await act(setup, ["enter"])
}

await describe("segment selection screen", async () => {
  await it("uses the shared standalone fixture", () => {
    assert.equal(standaloneMessage, fixture)
  })

  await it("keeps the message layout and blank lines", async () => {
    const setup = await mount({})
    await setup.flush()
    const start = anchor(setup, "Alpha.")
    assert.deepEqual(lines(setup).slice(start, start + 4), ["Alpha.", "", "Beta.", "Gamma."])
    setup.renderer.destroy()
  })

  await it("highlights the first segment with the accent background", async () => {
    const setup = await mount({})
    await act(setup, ["down"])
    assert.ok(span(setup, "Alpha.")?.bg.equals(standalonePalette.accent))
    setup.renderer.destroy()
  })

  await it("moves the highlight without retaining it on previously visited segments", async () => {
    const setup = await mount({})
    await act(setup, ["down", "down"])
    assert.notEqual(span(setup, "Alpha.")?.bg?.equals(standalonePalette.accent), true)
    assert.ok(span(setup, "Beta.")?.bg.equals(standalonePalette.accent))
    assert.notEqual(span(setup, "Gamma.")?.bg?.equals(standalonePalette.accent), true)
    setup.renderer.destroy()
  })

  await it("marks a selected segment with the primary background", async () => {
    const setup = await mount({})
    await act(setup, ["down", "space"])
    assert.ok(span(setup, "Alpha.")?.bg.equals(standalonePalette.primary))
    setup.renderer.destroy()
  })

  await it("removes selection without leaving stale highlight backgrounds", async () => {
    const setup = await mount({})
    await act(setup, ["down", "space", "down", "space", "up", "space"])
    assert.ok(span(setup, "Alpha.")?.bg.equals(standalonePalette.accent))
    assert.ok(span(setup, "Beta.")?.bg.equals(standalonePalette.primary))
    assert.notEqual(span(setup, "Gamma.")?.bg?.equals(standalonePalette.accent), true)
    setup.renderer.destroy()
  })

  await it("highlights the last segment on up from nothing", async () => {
    const setup = await mount({})
    await act(setup, ["up"])
    assert.ok(span(setup, "Gamma.")?.bg.equals(standalonePalette.accent))
    setup.renderer.destroy()
  })

  await it("closes from the selection screen with escape", async () => {
    let closed = 0
    const setup = await mount({ onClose: () => (closed += 1) })
    await act(setup, ["escape"])
    assert.equal(closed, 1)
    setup.renderer.destroy()
  })
})

await describe("reply composition screen", async () => {
  await it("quotes the selected segments with two blank lines between them", async () => {
    const setup = await mount({})
    await act(setup, ["down", "space", "down", "space", "enter"])
    const start = anchor(setup, '"Alpha."')
    assert.deepEqual(lines(setup).slice(start, start + 4), ['"Alpha."', "", "", '"Beta."'])
    assert.ok(span(setup, '"Alpha."')?.bg.equals(standalonePalette.primary))
    setup.renderer.destroy()
  })

  await it("shows the edited reply on a result screen after enter", async () => {
    const setup = await mount({})
    await submitEditedReply(setup)
    assert.ok(setup.captureCharFrame().includes("Composed reply"))
    assert.ok(setup.captureCharFrame().includes('"Alpha."'))
    assert.ok(setup.captureCharFrame().includes("X"))
    setup.renderer.destroy()
  })

  await it("returns to the selection screen with escape", async () => {
    const setup = await mount({})
    await act(setup, ["enter", "escape"])
    assert.ok(setup.captureCharFrame().includes("Up and Down highlight"))
    setup.renderer.destroy()
  })
})
