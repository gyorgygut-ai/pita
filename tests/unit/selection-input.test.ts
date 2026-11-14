import { describe, expect, it } from "vitest"
import { createPitaController } from "../../src/core/controller"
import { createSelectionInput } from "../../src/core/selection-input"

const key = (name: string, eventType: "press" | "repeat" | "release" = "press") => ({
  name,
  eventType,
  preventDefault: () => {},
})

const createController = () =>
  createPitaController({
    message: "Alpha. Beta. Gamma.",
    segments: [{ start: 0, end: 6 }, { start: 7, end: 12 }, { start: 13, end: 19 }],
    close: () => {},
    submit: () => {},
  })

const createInputWithSelectedMiddleSegment = () => {
  const controller = createController()
  const input = createSelectionInput(controller)
  controller.next()
  controller.toggle()
  controller.next()
  return { controller, input }
}

describe("createSelectionInput", () => {
  it("selects the highlighted segment immediately on Space press", () => {
    const controller = createController()
    const input = createSelectionInput(controller)
    input.handleKey(key("space"))
    expect(controller.selected()).toEqual([0])
  })

  it("ignores repeated Space key events", () => {
    const controller = createController()
    const input = createSelectionInput(controller)
    input.handleKey(key("space"))
    input.handleKey(key("space", "repeat"))
    expect(controller.selected()).toEqual([0])
  })

  it("moves with arrows without toggling their destinations", () => {
    const controller = createController()
    const input = createSelectionInput(controller)
    input.handleKey(key("space"))
    input.handleKey(key("down"))
    input.handleKey(key("down"))
    expect([controller.highlight(), controller.selected()]).toEqual([2, [0]])
  })

  it("toggles the currently highlighted segment on Space press", () => {
    const controller = createController()
    const input = createSelectionInput(controller)
    input.handleKey(key("down"))
    input.handleKey(key("space"))
    expect(controller.selected()).toEqual([1])
  })

  it("toggles an already-selected segment off on Space press", () => {
    const { controller, input } = createInputWithSelectedMiddleSegment()
    controller.prev()
    input.handleKey(key("space"))
    expect(controller.selected()).toEqual([])
  })

})
