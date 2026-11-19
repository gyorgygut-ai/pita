import type { KeyEvent } from "@opentui/core"
import type { PitaController } from "./controller.js"

export type SelectionKeyEvent = Pick<KeyEvent, "name" | "eventType" | "preventDefault">

export type SelectionInput = {
  handleKey: (key: SelectionKeyEvent) => void
}

export const createSelectionInput = (controller: PitaController): SelectionInput => ({
  handleKey: (key) => {
    if (controller.screen() !== "select" || (key.eventType !== "press" && key.eventType !== "repeat")) {
      return
    }
    if (key.name === "space") {
      if (key.eventType === "press") {
        key.preventDefault()
        controller.toggle()
      }
      return
    }
    if (key.name !== "up" && key.name !== "down") {
      return
    }
    key.preventDefault()
    if (key.name === "up") {
      controller.prev()
    } else {
      controller.next()
    }
  },
})
