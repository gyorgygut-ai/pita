import { Show, createSignal } from "solid-js"
import { RGBA } from "@opentui/core"
import type { TextareaRenderable } from "@opentui/core"
import { render, useKeyboard, useRenderer } from "@opentui/solid"
import type { JSX } from "@opentui/solid"
import { pathToFileURL } from "node:url"
import { createPitaController } from "./controller.js"
import { standaloneMessage } from "./fixtures.js"
import { PitaFrame, PitaShell, ReplyResultScreen } from "./screens.js"
import type { Segment } from "./segment.js"
import { sentenceStrategy } from "./strategies/sentence.js"
import { pitaTheme } from "./theme.js"
import type { PitaPalette } from "./theme.js"

export const standalonePalette: PitaPalette = {
  accent: RGBA.fromInts(59, 130, 246),
  primary: RGBA.fromInts(37, 99, 235),
  onAccent: RGBA.fromInts(11, 11, 11),
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

  useKeyboard((key) => {
    if (key.name === "down" && controller.screen() === "select") {
      key.preventDefault()
      controller.next()
      return
    }
    if (key.name === "up" && controller.screen() === "select") {
      key.preventDefault()
      controller.prev()
      return
    }
    if (key.name === "space" && controller.screen() === "select") {
      key.preventDefault()
      controller.toggle()
      return
    }
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
  const segments = await sentenceStrategy(message)
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
