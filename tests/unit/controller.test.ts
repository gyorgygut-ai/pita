import { describe, expect, it, vi } from "vitest"
import { createPitaController } from "../../src/core/controller"
import type { Segment } from "../../src/core/segment"
import type { SubmissionStrategy } from "../../src/strategies/submission"

const message = "One. Two. Three."
const segments: readonly Segment[] = [
  { start: 0, end: 4 },
  { start: 5, end: 9 },
  { start: 10, end: 16 },
]

const build = (close: () => void, submit: SubmissionStrategy) =>
  createPitaController({ message, segments, close, submit })

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

  it("replaces the composed reply", () => {
    const controller = build(vi.fn(), vi.fn())
    controller.compose()
    controller.setReply("edited")
    expect(controller.reply()).toBe("edited")
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

  it("delegates submitted text to its strategy", () => {
    const submit = vi.fn()
    const controller = build(vi.fn(), submit)
    controller.submit('"Three."')
    expect(submit).toHaveBeenCalledWith('"Three."')
  })
})
