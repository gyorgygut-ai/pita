import { For, Show, createSignal, onMount } from "solid-js"
import type { RGBA, TextareaRenderable } from "@opentui/core"
import type { JSX } from "@opentui/solid"
import { Plugin, usePlugin } from "@opencode/plugin/tui"
import type { PanelInput } from "@opencode/plugin/tui/context"
import { composeReply } from "./compose"
import { apfel } from "./index"
import { parseOptions } from "./options"
import { isSelected, nextIndex, prevIndex, toggleSelected } from "./selection"
import type { Segment } from "./segment"
import { resolveStrategy } from "./strategies"
import type { Strategy } from "./strategies"
import type { PitaTheme } from "./theme"
import { pitaTheme } from "./theme"

export const pitaPanelName = "pita.reply"

export type Screen = "select" | "compose"

export type AssistantText = (context: Plugin.Context, sessionID: string) => string

export type SelectScreenProps = {
  readonly message: () => string
  readonly segments: () => readonly Segment[]
  readonly highlight: () => number
  readonly selected: () => readonly number[]
  readonly theme: () => PitaTheme
}

export type ComposeScreenProps = {
  readonly reply: () => string
  readonly editor: (node: TextareaRenderable) => void
  readonly theme: () => PitaTheme
}

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

const picked = (props: SelectScreenProps, index: number): boolean =>
  isSelected(props.selected(), index)

const highlighted = (props: SelectScreenProps, index: number): boolean =>
  props.highlight() === index

const segmentBackground = (props: SelectScreenProps, index: number): RGBA | undefined => {
  if (picked(props, index)) {
    return props.theme().selected.background
  }
  if (highlighted(props, index)) {
    return props.theme().highlighted.background
  }
  return undefined
}

const segmentForeground = (props: SelectScreenProps, index: number): RGBA => {
  if (picked(props, index)) {
    return props.theme().selected.foreground
  }
  if (highlighted(props, index)) {
    return props.theme().highlighted.foreground
  }
  return props.theme().text
}

export type SelectScreen = (props: SelectScreenProps) => JSX.Element

export const SelectScreen: SelectScreen = (props) => (
  <box flexDirection="column">
    <text fg={props.theme().muted}>
      Up and Down highlight, Space toggles, Enter composes, Esc closes
    </text>
    <For each={props.segments()}>
      {(segment, index) => (
        <box backgroundColor={segmentBackground(props, index())}>
          <text fg={segmentForeground(props, index())}>
            {props.message().slice(segment.start, segment.end)}
          </text>
        </box>
      )}
    </For>
  </box>
)

export type ComposeScreen = (props: ComposeScreenProps) => JSX.Element

export const ComposeScreen: ComposeScreen = (props) => (
  <box flexDirection="column">
    <text fg={props.theme().muted}>Enter sends, Esc returns to the selection</text>
    <textarea
      ref={props.editor}
      focused
      initialValue={props.reply()}
      focusedBackgroundColor={props.theme().selected.background}
      focusedTextColor={props.theme().selected.foreground}
    />
  </box>
)

export type PitaPanel = (props: PitaPanelProps) => JSX.Element

export const PitaPanel: PitaPanel = (props) => {
  const context = usePlugin()
  const theme = () => pitaTheme(context.theme, context.themeMode)
  const [message, setMessage] = createSignal("")
  const [segments, setSegments] = createSignal<readonly Segment[]>([])
  const [highlight, setHighlight] = createSignal(-1)
  const [selected, setSelected] = createSignal<readonly number[]>([])
  const [screen, setScreen] = createSignal<Screen>("select")
  const [reply, setReply] = createSignal("")
  const [editor, setEditor] = createSignal<TextareaRenderable | undefined>(undefined)

  const attachEditor = (node: TextareaRenderable) => setEditor(node)

  const close = (): void => props.panel.close()

  const send = async (): Promise<void> => {
    await context.client.session.prompt({
      sessionID: props.panel.sessionID,
      text: editor()?.plainText ?? reply(),
    })
    close()
  }

  const accept = (): void => {
    if (screen() === "select") {
      setReply(composeReply(message(), segments(), selected()))
      setScreen("compose")
      return
    }
    void send()
  }

  const back = (): void => {
    if (screen() === "compose") {
      setScreen("select")
      return
    }
    close()
  }

  const toggle = (): void => {
    const index = highlight()
    if (index >= 0) {
      setSelected(toggleSelected(selected(), index))
    }
  }

  context.keymap.layer(() => ({
    commands: [
      {
        id: "pita.segment.next",
        title: "Pita: highlight next segment",
        bind: "down",
        enabled: () => screen() === "select",
        run: () => setHighlight(nextIndex(highlight(), segments().length)),
      },
      {
        id: "pita.segment.previous",
        title: "Pita: highlight previous segment",
        bind: "up",
        enabled: () => screen() === "select",
        run: () => setHighlight(prevIndex(highlight(), segments().length)),
      },
      {
        id: "pita.segment.toggle",
        title: "Pita: toggle highlighted segment",
        bind: "space",
        enabled: () => screen() === "select",
        run: toggle,
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
        run: back,
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
    const text = lastAssistantText(context, props.panel.sessionID)
    setMessage(text)
    setSegments(await props.strategy(text))
  }

  onMount(() => {
    void load()
  })

  return (
    <box
      flexDirection="column"
      padding={1}
      borderStyle="single"
      borderColor={theme().border}
    >
      <Show
        when={screen() === "select"}
        fallback={<ComposeScreen reply={reply} editor={attachEditor} theme={theme} />}
      >
        <SelectScreen
          message={message}
          segments={segments}
          highlight={highlight}
          selected={selected}
          theme={theme}
        />
      </Show>
    </box>
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
