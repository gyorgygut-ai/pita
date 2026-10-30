import { describe, expect, it, vi } from "vitest"
import { createPitaController } from "../../src/controller"
import type { Segment } from "../../src/segment"

const message = "One. Two. Three."
const segments: readonly Segment[] = [
  { start: 0, end: 4 },
  { start: 5, end: 9 },
  { start: 10, end: 16 },
]

const build = (close: () => void, send: (text: string) => void) =>
  createPitaController({ message, segments, close, send })

describe("createPitaController", () => {
  it("starts on the selection screen with nothing highlighted", () => {
    const controller = build(vi.fn(), vi.fn())
    expect(controller.screen()).toBe("select")
    expect(controller.highlight()).toBe(-1)
    expect(controller.selected()).toEqual([])
  })

  it("wraps the highlight around the segment list", () => {
    const controller = build(vi.fn(), vi.fn())
    controller.prev()
    expect(controller.highlight()).toBe(2)
    controller.next()
    expect(controller.highlight()).toBe(0)
  })

  it("toggles the highlighted segment on and off", () => {
    const controller = build(vi.fn(), vi.fn())
    controller.next()
    controller.toggle()
    expect(controller.selected()).toEqual([0])
    controller.toggle()
    expect(controller.selected()).toEqual([])
  })

  it("fills the reply with the quoted selection and opens composition", () => {
    const controller = build(vi.fn(), vi.fn())
    controller.prev()
    controller.toggle()
    controller.compose()
    expect(controller.screen()).toBe("compose")
    expect(controller.reply()).toBe('"Three."')
  })

  it("returns from composition to the selection", () => {
    const close = vi.fn()
    const controller = build(close, vi.fn())
    controller.compose()
    controller.back()
    expect(controller.screen()).toBe("select")
    expect(close).not.toHaveBeenCalled()
  })

  it("closes from the selection screen", () => {
    const close = vi.fn()
    const controller = build(close, vi.fn())
    controller.back()
    expect(close).toHaveBeenCalledOnce()
  })

  it("submits the composed text", () => {
    const send = vi.fn()
    const controller = build(vi.fn(), send)
    controller.compose()
    controller.submit('"Three."')
    expect(send).toHaveBeenCalledWith('"Three."')
  })
})
