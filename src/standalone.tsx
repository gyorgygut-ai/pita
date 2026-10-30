import { createSignal } from "solid-js"
import { RGBA } from "@opentui/core"
import type { TextareaRenderable } from "@opentui/core"
import { render, useKeyboard, useRenderer } from "@opentui/solid"
import type { JSX } from "@opentui/solid"
import { pathToFileURL } from "node:url"
import { createPitaController } from "./controller.js"
import { standaloneMessage } from "./fixtures.js"
import { PitaShell } from "./screens.js"
import type { Segment } from "./segment.js"
import { sentenceStrategy } from "./strategies/sentence.js"
import { pitaTheme } from "./theme.js"
import type { PitaPalette } from "./theme.js"

const palette: PitaPalette = {
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
  readonly onSend?: (text: string) => void
  readonly onClose?: () => void
}

export type StandaloneApp = (props: StandaloneAppProps) => JSX.Element

export const StandaloneApp: StandaloneApp = (props) => {
  const renderer = useRenderer()
  const [editor, setEditor] = createSignal<TextareaRenderable | undefined>(undefined)

  const controller = createPitaController({
    message: props.message,
    segments: props.segments,
    close: () => {
      props.onClose?.()
      renderer.destroy()
    },
    send: (text) => {
      props.onSend?.(text)
      renderer.destroy()
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

  return (
    <PitaShell
      controller={controller}
      theme={() => pitaTheme(palette)}
      editor={(node) => setEditor(node)}
    />
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
      onSend={(text) => {
        process.stdout.write(`${text}\n`)
      }}
    />
  ))
}

const entry = process.argv[1]
if (entry !== undefined && import.meta.url === pathToFileURL(entry).href) {
  void startStandalone()
}
