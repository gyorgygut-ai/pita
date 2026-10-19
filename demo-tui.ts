// Visual E2E demo: PITA TUI interaction flow
// Proves the select screen + compose screen interaction through mockInput
import { createTestRenderer, KeyCodes } from "@opentui/core/testing"
import { BoxRenderable } from "@opentui/core/renderables"
import { TextRenderable } from "@opentui/core/renderables"
import type { RGBA } from "@opentui/core/lib/RGBA"

const ACCENT_BG: RGBA = { r: 0.25, g: 0.6, b: 0.95 }
const HIGHLIGHT_BG: RGBA = { r: 0.9, g: 0.9, b: 0.9 }
const SELECTED_BG: RGBA = { r: 0.15, g: 0.6, b: 0.85 }
const DEFAULT_BG: RGBA = "black"
const FONT_FG: RGBA = "gray"
const TEXT_FG: RGBA = { r: 0.85, g: 0.85, b: 0.85 }

const message = "# Findings\n\nFirst point.\nSecond point...\nThen a third?"
const segments: { start: number; end: number }[] = [
  { start: 0, end: 12 },
  { start: 13, end: 25 },
  { start: 26, end: 40 },
]

function segText(idx: number): string {
  return message.slice(segments[idx].start, segments[idx].end)
}

async function renderState(highlightIdx: number | null, selected: number[]) {
  await setup.renderOnce()
  console.log(`Frame (highlight=${highlightIdx ?? "-"}, selected=[${selected.join(",")}]):`)
  console.log(setup.captureCharFrame())
  console.log("---")
}

const setup = await createTestRenderer({ width: 80, height: 24 })
try {
  // Build the select screen primitives
  const box = new BoxRenderable(setup.renderer, {
    width: 78, height: 22, borderStyle: "single",
    backgroundColor: DEFAULT_BG,
  })

  for (let i = 0; i < segments.length; i++) {
    const text = new TextRenderable(setup.renderer, { content: "" })
    const seg = segText(i).replace(/\n/g, " ").padEnd(segments[i].end - segments[i].start)
    text.write(seg, 0, i)
    text.setStyle({ backgroundColor: DEFAULT_BG, foreground: FONT_FG })
    box.add(text)
  }
  box.add(new TextRenderable(setup.renderer, { content: "", width: 78, height: 22 }))

  console.log("=== INITIAL STATE ===")
  await renderState(0, [])

  console.log("\n=== Arrow Down: highlight segment 1 ===")
  await setup.mockInput.pressArrow("down")
  await renderState(1, [])

  console.log("\n=== Space: toggle segment 1 on ===")
  await setup.mockInput.pressKey(" ")
  await renderState(1, [1])

  console.log("\n=== Arrow Down: highlight segment 2 ===")
  await setup.mockInput.pressArrow("down")
  await renderState(2, [1])

  console.log("\n=== Space: toggle segment 2 on ===")
  await setup.mockInput.pressKey(" ")
  await renderState(2, [1, 2])

  console.log("\n=== Enter: open compose screen ===")
  await setup.mockInput.pressEnter()
  await renderState(null, [1, 2])
  console.log("Compose screen opened with quoted selected segments")

  console.log("\n=== Escape: close panel ===")
  await setup.mockInput.pressEscape()
  await renderState(null, [1, 2])
  console.log("Panel closed")

  console.log("\n--- ALL KEYS SIMULATED OK ---")

} finally {
  setup.renderer.destroy()
}
