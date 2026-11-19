import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { createComponent } from "solid-js"
import { RGBA } from "@opentui/core"
import { testRender } from "@opentui/solid"
import { createPitaController } from "../../dist/core/controller.js"
import { ComposeScreen } from "../../dist/ui/screens.js"

await describe("composition Enter submission", async () => {
  await it("inserts a literal space when the Space key is pressed in the editor", async () => {
    const controller = createPitaController({
      message: "Alpha.",
      segments: [{ start: 0, end: 6 }],
      close: () => {},
      submit: () => {},
    })
    controller.toggle()
    controller.compose()
    const color = RGBA.fromInts(255, 255, 255)
    const theme = () => ({
      muted: color,
      selected: { foreground: color, background: color },
    })
    const setup = await testRender(
      () => createComponent(ComposeScreen, { controller, theme, editor: () => {} }),
      { width: 40, height: 10, kittyKeyboard: true },
    )

    try {
      await setup.flush()
      await setup.mockInput.typeText("hello")
      setup.mockInput.pressKey(" ")
      await setup.mockInput.typeText("world")
      await setup.flush()
      assert.ok(controller.reply().includes("hello world"))
    } finally {
      setup.renderer.destroy()
    }
  })

  await it("inserts Space even when an earlier host keyboard handler prevents its default", async () => {
    const controller = createPitaController({
      message: "Alpha.",
      segments: [{ start: 0, end: 6 }],
      close: () => {},
      submit: () => {},
    })
    controller.toggle()
    controller.compose()
    const color = RGBA.fromInts(255, 255, 255)
    const theme = () => ({
      muted: color,
      selected: { foreground: color, background: color },
    })
    const setup = await testRender(
      () => createComponent(ComposeScreen, { controller, theme, editor: () => {} }),
      { width: 40, height: 10, kittyKeyboard: true },
    )
    const hostKeyHandler = (key: { readonly name: string; preventDefault: () => void }): void => {
      if (key.name === "space") {
        key.preventDefault()
      }
    }

    try {
      await setup.flush()
      setup.renderer.keyInput.prependListener("keypress", hostKeyHandler)
      await setup.mockInput.typeText("hello")
      setup.mockInput.pressKey(" ")
      await setup.mockInput.typeText("world")
      await setup.flush()
      assert.ok(controller.reply().includes("hello world"))
    } finally {
      setup.renderer.destroy()
    }
  })

  await it("submits the edited textarea content when Enter is pressed", async () => {
    const submitted: string[] = []
    const controller = createPitaController({
      message: "Alpha.",
      segments: [{ start: 0, end: 6 }],
      close: () => {},
      submit: (text) => submitted.push(text),
    })
    controller.toggle()
    controller.compose()
    const color = RGBA.fromInts(255, 255, 255)
    const theme = () => ({
      muted: color,
      selected: { foreground: color, background: color },
    })
    const setup = await testRender(
      () => createComponent(ComposeScreen, { controller, theme, editor: () => {} }),
      { width: 40, height: 10, kittyKeyboard: true },
    )

    try {
      await setup.flush()
      await setup.mockInput.typeText("edited")
      setup.mockInput.pressEnter()
      await setup.flush()
      assert.deepEqual(submitted, ['edited"Alpha."\n\n\n'])
    } finally {
      setup.renderer.destroy()
    }
  })
})
