import { Show, createSignal, onCleanup, onMount } from "solid-js"
import { RGBA } from "@opentui/core"
import type { TextareaRenderable } from "@opentui/core"
import { render, useKeyboard, useRenderer } from "@opentui/solid"
import type { JSX } from "@opentui/solid"
import { pathToFileURL } from "node:url"
import { readFileSync } from "node:fs"
import { createPitaController } from "../../core/controller.js"
import { createSelectionInput } from "../../core/selection-input.js"
import { PitaFrame, PitaShell, ReplyResultScreen } from "../../ui/screens.js"
import type { Segment } from "../../core/segment.js"
import { regexStrategy } from "../../strategies/index.js"
import { pitaTheme } from "../../ui/theme.js"
import type { PitaPalette } from "../../ui/theme.js"

export const standaloneMessage = readFileSync(
  new URL("../../../tests/fixtures/standalone-message.txt", import.meta.url),
  "utf8",
).trimEnd()

export const standalonePalette: PitaPalette = {
  accent: RGBA.fromInts(59, 130, 246),
  primary: RGBA.fromInts(37, 99, 235),
  onPrimary: RGBA.fromInts(255, 255, 255),
  text: RGBA.fromInts(229, 229, 229),
  muted: RGBA.fromInts(163, 163, 163),
  border: RGBA.fromInts(82, 82, 82),
}

export type StandaloneAppProps = {
  readonly message: string
  readonly segments: readonly Segment[]
  readonly onClose?: () => void
}

export type StandaloneApp = (props: StandaloneAppProps) => JSX.Element

export const StandaloneApp: StandaloneApp = (props) => {
  const renderer = useRenderer()
  onMount(() => {
    renderer.enableKittyKeyboard(5)
    onCleanup(() => renderer.enableKittyKeyboard(5))
  })
  const [editor, setEditor] = createSignal<TextareaRenderable | undefined>(undefined)
  const [submitted, setSubmitted] = createSignal<{ readonly text: string }>()

  const controller = createPitaController({
    message: props.message,
    segments: props.segments,
    close: () => {
      props.onClose?.()
      renderer.destroy()
    },
    submit: (text) => {
      setSubmitted({ text })
    },
  })
  const selectionInput = createSelectionInput(controller)

  useKeyboard((key) => {
    selectionInput.handleKey(key)
    if (key.name === "return") {
      key.preventDefault()
      if (controller.screen() === "select") {
        controller.compose()
        return
      }
      controller.submit(editor()?.plainText ?? controller.reply())
      return
    }
    if (key.name === "escape") {
      key.preventDefault()
      controller.back()
    }
  })

  const theme = () => pitaTheme(standalonePalette)

  return (
    <Show when={submitted()} fallback={<PitaShell controller={controller} theme={theme} editor={setEditor} />}>
      {(result) => (
        <PitaFrame theme={theme}>
          <ReplyResultScreen text={result().text} />
        </PitaFrame>
      )}
    </Show>
  )
}

export const startStandalone = async (
  message: string = standaloneMessage
): Promise<void> => {
  const segments = await regexStrategy(message)
  await render(() => (
    <StandaloneApp
      message={message}
      segments={segments}
    />
  ))
}

const entry = process.argv[1]
if (entry !== undefined && import.meta.url === pathToFileURL(entry).href) {
  void startStandalone()
}
