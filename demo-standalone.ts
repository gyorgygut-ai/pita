import { createTestRenderer } from "@opentui/core/testing"
import { BoxRenderable, TextRenderable } from "@opentui/core"

type Segment = { start: number; end: number }

const message = "# Findings\n\nFirst point.\nSecond point...\nThen a third?"
const segments: Segment[] = splitSentences(message)

function splitSentences(msg: string): Segment[] {
  const pattern = /[^.!?…\n]+[.!?…]*/g
  const segs: Segment[] = []
  for (const m of msg.matchAll(pattern)) {
    const raw = m[0]
    const text = raw.trim()
    if (text.length > 0) {
      const start = (m.index ?? 0) + raw.indexOf(text)
      segs.push({ start, end: start + text.length })
    }
  }
  return segs
}

function toggleSelected(sel: number[], idx: number): number[] {
  return sel.includes(idx)
    ? sel.filter((v) => v !== idx).sort((a, b) => a - b)
    : [...sel, idx].sort((a, b) => a - b)
}

function composeReply(msg: string, segs: Segment[], sel: number[]): string {
  return sel.map((i) => `"${msg.slice(segs[i].start, segs[i].end)}"`).join("\n\n\n")
}

function renderState(setup, highlight, selected) {
  const oldBox = setup.renderer.root.children[0]
  if (oldBox) oldBox.destroy()
  const box = new BoxRenderable(setup.renderer, { width: 78, height: 22, borderStyle: "single" })
  setup.renderer.root.add(box)

  for (let i = 0; i < segments.length; i++) {
    const seg = message.slice(segments[i].start, segments[i].end).replace(/\n/g, " ")
    const isH = i === highlight
    const isS = selected.includes(i)
    let label = "  "
    if (isS) label = "# "
    else if (isH) label = "> "
    box.add(new TextRenderable(setup.renderer, { content: label + seg, width: 76 }))
  }
  box.add(new TextRenderable(setup.renderer, { content: "", width: 76 }))

  return setup.renderOnce().then(() => setup.captureCharFrame())
}

async function main() {
  const setup = await createTestRenderer({ width: 80, height: 24 })
  try {
    console.log("=== PITA TUI — Segment Select (standalone demo) ===")
    console.log("(> = highlighted, # = selected)")
    console.log("")

    console.log("--- Initial (highlight=0, selected=[]) ---")
    console.log(await renderState(setup, 0, []))

    console.log("\n--- Arrow Down (highlight=1) ---")
    await setup.mockInput.pressArrow("down")
    console.log(await renderState(setup, 1, []))

    console.log("\n--- Space (toggle seg 1) ---")
    await setup.mockInput.pressKey(" ")
    console.log(await renderState(setup, 1, [1]))

    console.log("\n--- Arrow Down (highlight=2) ---")
    await setup.mockInput.pressArrow("down")
    console.log(await renderState(setup, 2, [1]))

    console.log("\n--- Space (toggle seg 2) ---")
    await setup.mockInput.pressKey(" ")
    console.log(await renderState(setup, 2, [1, 2]))

    console.log("\n--- Enter: compose screen ---")
    await setup.mockInput.pressEnter()
    const reply = composeReply(message, segments, [1, 2])
    console.log(reply)

    console.log("\n--- Escape: close ---")
    await setup.mockInput.pressEscape()
    console.log("(panel closed)")

    console.log("\n--- ALL KEYS SIMULATED OK ---")
  } finally {
    setup.renderer.destroy()
  }
}

main().catch(e => { console.error("FAIL:", e); process.exit(1) })
