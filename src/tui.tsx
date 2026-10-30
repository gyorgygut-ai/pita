import { Show, createSignal, onMount } from "solid-js"
import type { TextareaRenderable } from "@opentui/core"
import type { JSX } from "@opentui/solid"
import { Plugin, usePlugin } from "@opencode/plugin/tui"
import type { PanelInput } from "@opencode/plugin/tui/context"
import { apfel } from "./apfel.js"
import { createPitaController } from "./controller.js"
import type { PitaController } from "./controller.js"
import { parseOptions } from "./options.js"
import { PitaShell } from "./screens.js"
import { resolveStrategy } from "./strategies/index.js"
import type { Strategy } from "./strategies/index.js"
import { opencodePitaTheme } from "./theme-opencode.js"

export const pitaPanelName = "pita.reply"

export type AssistantText = (context: Plugin.Context, sessionID: string) => string

export type PitaPanelProps = {
  readonly panel: PanelInput
  readonly strategy: Strategy
}

export type PitaPanelClaim = {
  readonly append: "session.panel"
  readonly render: (panel: PanelInput) => JSX.Element
}

export type PitaPanelContribution = (strategy: Strategy) => PitaPanelClaim

export const lastAssistantText: AssistantText = (context, sessionID) => {
  const messages = context.data.session.message.list(sessionID)
  const assistant = messages.filter((message) => message.type === "assistant").at(-1)
  if (assistant === undefined) {
    return ""
  }
  return assistant.content
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("")
}

export type PitaPanel = (props: PitaPanelProps) => JSX.Element

export const PitaPanel: PitaPanel = (props) => {
  const context = usePlugin()
  const theme = () => opencodePitaTheme(context.theme, context.themeMode)
  const [controller, setController] = createSignal<PitaController>()
  const [editor, setEditor] = createSignal<TextareaRenderable | undefined>(undefined)

  const attachEditor = (node: TextareaRenderable) => setEditor(node)

  const accept = (): void => {
    const current = controller()
    if (current === undefined) {
      return
    }
    if (current.screen() === "select") {
      current.compose()
      return
    }
    current.submit(editor()?.plainText ?? current.reply())
  }

  context.keymap.layer(() => ({
    commands: [
      {
        id: "pita.segment.next",
        title: "Pita: highlight next segment",
        bind: "down",
        enabled: () => controller()?.screen() === "select",
        run: () => controller()?.next(),
      },
      {
        id: "pita.segment.previous",
        title: "Pita: highlight previous segment",
        bind: "up",
        enabled: () => controller()?.screen() === "select",
        run: () => controller()?.prev(),
      },
      {
        id: "pita.segment.toggle",
        title: "Pita: toggle highlighted segment",
        bind: "space",
        enabled: () => controller()?.screen() === "select",
        run: () => controller()?.toggle(),
      },
      {
        id: "pita.accept",
        title: "Pita: compose reply or send it",
        bind: "return",
        run: accept,
      },
      {
        id: "pita.back",
        title: "Pita: return or close",
        bind: "escape",
        run: () => controller()?.back(),
      },
    ],
    bindings: [
      "pita.segment.next",
      "pita.segment.previous",
      "pita.segment.toggle",
      "pita.accept",
      "pita.back",
    ],
  }))

  const load = async (): Promise<void> => {
    await context.data.session.message.sync(props.panel.sessionID)
    const message = lastAssistantText(context, props.panel.sessionID)
    setController(
      createPitaController({
        message,
        segments: await props.strategy(message),
        close: () => props.panel.close(),
        send: (text) =>
          context.client.session.prompt({ sessionID: props.panel.sessionID, text }),
      })
    )
  }

  onMount(() => {
    void load()
  })

  return (
    <Show when={controller()}>
      {(current) => <PitaShell controller={current()} theme={theme} editor={attachEditor} />}
    </Show>
  )
}

export const pitaPanelContribution: PitaPanelContribution = (strategy) => ({
  append: "session.panel",
  render: (panel) => (
    <Show when={panel.name === pitaPanelName}>
      <PitaPanel panel={panel} strategy={strategy} />
    </Show>
  ),
})

export default Plugin.define({
  id: "pita",
  setup: (context) => {
    const { strategy } = parseOptions(context.options)
    const unregister = context.ui.slot(
      pitaPanelContribution(resolveStrategy(strategy, { runApfel: apfel }))
    )

    context.keymap.layer(() => ({
      mode: "global",
      commands: [
        {
          id: "pita.open",
          title: "Pita: reply to segments",
          description: "Select segments of the last assistant message and compose a reply",
          bind: "<leader>p",
          palette: true,
          run: () => {
            context.ui.panel.open(pitaPanelName, { presentation: "fullscreen" })
          },
        },
      ],
      bindings: ["pita.open"],
    }))

    return unregister
  },
})
