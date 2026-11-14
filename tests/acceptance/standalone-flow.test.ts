import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { createComponent } from "solid-js"
import { testRender } from "@opentui/solid"
import type { TestRendererSetup } from "@opentui/core/testing"
import type { Segment } from "../../src/core/segment.js"
import { StandaloneApp, standaloneMessage, standalonePalette } from "../../dist/hosts/standalone/standalone.js"
import { regexStrategy } from "../../dist/strategies/regex.js"

const message = "Alpha.\n\nBeta.\nGamma."
const fixture = readFileSync(new URL("../fixtures/standalone-message.txt", import.meta.url), "utf8")
const segments: readonly Segment[] = [
  { start: 0, end: 6 },
  { start: 8, end: 13 },
  { start: 14, end: 20 },
]

type HarnessProps = {
  readonly onClose?: () => void
  readonly message?: string
  readonly segments?: readonly Segment[]
}

const mount = ({ message: text = message, segments: ranges = segments, ...props }: HarnessProps): Promise<TestRendererSetup> =>
  testRender(() => createComponent(StandaloneApp, { message: text, segments: ranges, ...props }), {
    width: 40,
    height: 14,
    kittyKeyboard: true,
  })

const mountFixture = async (): Promise<TestRendererSetup> =>
  mount({ message: fixture, segments: await regexStrategy(fixture) })

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

const fixtureStyleState = (setup: TestRendererSetup): readonly [boolean, number] => {
  const spans = setup.captureSpans().lines.flatMap((line) => line.spans)
  return [
    spans.some((item) => item.bg.equals(standalonePalette.primary)),
    spans.filter((item) => item.fg.equals(standalonePalette.accent)).length,
  ]
}

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
  await act(setup, ["space", "enter"])
  await setup.mockInput.typeText("X")
  await settle(setup)
  await act(setup, ["enter"])
}

await describe("segment selection screen", async () => {
  await it("renders the full standalone fixture without broad selected styling", async () => {
    const setup = await mountFixture()
    await settle(setup)
    assert.deepEqual([standaloneMessage === fixture, ...fixtureStyleState(setup)], [true, false, 1])
    setup.renderer.destroy()
  })

  await it("keeps the message layout and blank lines", async () => {
    const setup = await mount({})
    await setup.flush()
    const start = anchor(setup, "Alpha.")
    assert.deepEqual(lines(setup).slice(start, start + 4), ["Alpha.", "", "Beta.", "Gamma."])
    setup.renderer.destroy()
  })

  await it("highlights the first segment with accent foreground only", async () => {
    const setup = await mount({})
    await settle(setup)
    assert.deepEqual(
      [
        span(setup, "Alpha.")?.fg.equals(standalonePalette.accent),
        span(setup, "Alpha.")?.bg.equals(span(setup, "Beta.")?.bg),
      ],
      [true, true],
    )
    setup.renderer.destroy()
  })

  await it("moves the highlight without retaining it on previously visited segments", async () => {
    const setup = await mount({})
    await act(setup, ["down"])
    assert.deepEqual(
      [
        span(setup, "Alpha.")?.fg.equals(standalonePalette.text),
        span(setup, "Beta.")?.fg.equals(standalonePalette.accent),
        span(setup, "Gamma.")?.fg.equals(standalonePalette.text),
        span(setup, "Alpha.")?.bg.equals(span(setup, "Beta.")?.bg),
        span(setup, "Beta.")?.bg.equals(span(setup, "Gamma.")?.bg),
      ],
      [true, true, true, true, true],
    )
    setup.renderer.destroy()
  })

  await it("marks a selected segment with the primary background", async () => {
    const setup = await mount({})
    await act(setup, ["space", "down"])
    assert.deepEqual(
      [
        span(setup, "Alpha.")?.bg.equals(standalonePalette.primary),
        span(setup, "Alpha.")?.fg.equals(standalonePalette.onPrimary),
      ],
      [true, true],
    )
    setup.renderer.destroy()
  })

  await it("removes selection without leaving stale highlight backgrounds", async () => {
    const setup = await mount({})
    await act(setup, ["space", "down", "space", "up", "space"])
    assert.deepEqual(
      [
        span(setup, "Alpha.")?.fg.equals(standalonePalette.accent),
        span(setup, "Alpha.")?.bg.equals(span(setup, "Gamma.")?.bg),
        span(setup, "Beta.")?.bg.equals(standalonePalette.primary),
        span(setup, "Gamma.")?.fg.equals(standalonePalette.text),
      ],
      [true, true, true, true],
    )
    setup.renderer.destroy()
  })

  await it("applies selected background and highlighted foreground together", async () => {
    const setup = await mount({})
    await act(setup, ["space"])
    assert.deepEqual(
      [
        span(setup, "Alpha.")?.bg.equals(standalonePalette.primary),
        span(setup, "Alpha.")?.fg.equals(standalonePalette.accent),
      ],
      [true, true],
    )
    setup.renderer.destroy()
  })

  await it("highlights the last segment on up from the first segment", async () => {
    const setup = await mount({})
    await act(setup, ["up"])
    assert.deepEqual(
      [
        span(setup, "Gamma.")?.fg.equals(standalonePalette.accent),
        span(setup, "Gamma.")?.bg.equals(span(setup, "Alpha.")?.bg),
      ],
      [true, true],
    )
    setup.renderer.destroy()
  })

  await it("selects on Space and leaves later arrow navigation unselected", async () => {
    const setup = await mount({})
    await act(setup, ["space", "down", "down", "up", "up"])
    assert.deepEqual(
      [
        span(setup, "Alpha.")?.bg.equals(standalonePalette.primary),
        span(setup, "Beta.")?.bg.equals(standalonePalette.primary),
        span(setup, "Gamma.")?.bg.equals(standalonePalette.primary),
        span(setup, "Alpha.")?.fg.equals(standalonePalette.accent),
      ],
      [true, false, false, true],
    )
    setup.renderer.destroy()
  })

  await it("toggles the highlighted selection off on the next Space press", async () => {
    const setup = await mount({})
    await act(setup, ["space", "space"])
    assert.equal(span(setup, "Alpha.")?.bg.equals(standalonePalette.primary), false)
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
    await act(setup, ["space", "down", "space", "enter"])
    const start = anchor(setup, '"Alpha."')
    assert.deepEqual(lines(setup).slice(start, start + 4), ['"Alpha."', "", "", '"Beta."'])
    assert.ok(span(setup, '"Alpha."')?.bg.equals(standalonePalette.primary))
    const afterLastQuote = anchor(setup, '"Beta."') + 1
    assert.deepEqual(lines(setup).slice(afterLastQuote, afterLastQuote + 2), ["", ""])
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

  await it("inserts literal spaces in the editor and keeps Space working after returning", async () => {
    const setup = await mount({})
    await act(setup, ["space", "enter"])
    await setup.mockInput.typeText("hello world")
    await settle(setup)
    assert.ok(setup.captureCharFrame().includes("hello world"))
    await act(setup, ["escape", "space"])
    assert.equal(span(setup, "Alpha.")?.bg.equals(standalonePalette.primary), false)
    setup.renderer.destroy()
  })
})
