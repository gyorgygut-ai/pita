import { Show, createSignal, onCleanup, onMount } from "solid-js"
import type { TextareaRenderable } from "@opentui/core"
import { useRenderer } from "@opentui/solid"
import type { JSX } from "@opentui/solid"
import { Plugin, usePlugin } from "@opencode/plugin/tui"
import type { ResolvedTheme } from "@opencode/theme/tui"
import { createPitaController } from "../../core/controller.js"
import type { PitaController } from "../../core/controller.js"
import { parseOptions } from "../../config/options.js"
import { PitaShell } from "../../ui/screens.js"
import { resolveStrategy } from "../../strategies/index.js"
import type { Strategy } from "../../strategies/index.js"
import type { SubmissionStrategy } from "../../strategies/submission.js"
import type { PitaTheme } from "../../ui/theme.js"
import { pitaTheme } from "../../ui/theme.js"

export const pitaPageName = "pita.reply"

type OpenCodePrompt = (
  input: { readonly sessionID: string; readonly text: string }
) => void | Promise<unknown>

export const createOpenCodeSubmissionStrategy = (
  sessionID: string,
  prompt: OpenCodePrompt,
  onSubmitted: () => void,
): SubmissionStrategy =>
  async (text) => {
    await prompt({ sessionID, text })
    onSubmitted()
  }

export const createOpenCodeReturnToChat = (
  navigateToSession: () => void,
  dispatch: (commandID: string) => void,
): (() => void) =>
  () => {
    navigateToSession()
    dispatch("session.last")
  }

const opencodePitaTheme = (theme: ResolvedTheme, mode: "dark" | "light"): PitaTheme =>
  pitaTheme({
    accent: theme.hue.accent[200],
    primary: theme.hue.interactive[200],
    onPrimary: mode === "dark" ? theme.hue.neutral[100] : theme.hue.neutral[900],
    text: theme.text.base,
    muted: theme.text.muted,
    border: theme.border.base,
  })

export type AssistantText = (context: Plugin.Context, sessionID: string) => string

export const assistantText = (
  content: readonly { readonly type: string; readonly text?: string }[]
): string =>
  content
    .filter((part) => part.type === "text")
    .map((part) => part.text ?? "")
    .join("")

export const lastAssistantText: AssistantText = (context, sessionID) => {
  const messages = context.data.session.message.list(sessionID)
  const assistant = messages.filter((message) => message.type === "assistant").at(-1)
  if (assistant === undefined) {
    return ""
  }
  return assistantText(assistant.content)
}

export type PitaReplyProps = {
  readonly sessionID: string
  readonly strategy: Strategy
}

export type PitaReply = (props: PitaReplyProps) => JSX.Element

export const PitaReply: PitaReply = (props) => {
  const context = usePlugin()
  const renderer = useRenderer()
  const theme = () => opencodePitaTheme(context.theme, context.themeMode)
  const [controller, setController] = createSignal<PitaController>()
  const [editor, setEditor] = createSignal<TextareaRenderable | undefined>(undefined)

  onMount(() => {
    renderer.enableKittyKeyboard(5)
    onCleanup(() => renderer.enableKittyKeyboard(5))
  })

  const attachEditor = (node: TextareaRenderable) => setEditor(node)

  const close = (): void => {
    context.ui.router.navigate({ type: "session", sessionID: props.sessionID })
  }

  const returnToChat = createOpenCodeReturnToChat(
    close,
    (commandID) => context.keymap.dispatch(commandID),
  )

  const submit = createOpenCodeSubmissionStrategy(
    props.sessionID,
    (input) => context.client.session.prompt(input),
    returnToChat,
  )

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
    mode: "global",
    priority: 100,
    commands: [
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
      "pita.accept",
      "pita.back",
    ],
  }))

  const load = async (): Promise<void> => {
    await context.data.session.message.sync(props.sessionID)
    const message = lastAssistantText(context, props.sessionID)
    const current = createPitaController({
        message,
        segments: await props.strategy(message),
        close,
        submit,
      })
    setController(current)
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

export default Plugin.define({
  id: "pita",
  setup: (context) => {
    const { strategy, keybind } = parseOptions(context.options)
    const run = resolveStrategy(strategy)

    const unregister = context.ui.router.register({
      name: pitaPageName,
      render: ({ data }) => {
        const sessionID = typeof data?.sessionID === "string" ? data.sessionID : undefined
        return (
          <Show when={sessionID}>
            {(current) => <PitaReply sessionID={current()} strategy={run} />}
          </Show>
        )
      },
    })

    context.keymap.layer(() => ({
      mode: "global",
      commands: [
        {
          id: "pita.open",
          title: "Pita: reply to segments",
          description: "Select segments of the last assistant message and compose a reply",
          bind: keybind,
          palette: true,
          run: () => {
            const current = context.ui.router.current()
            if (current.type !== "session") {
              return
            }
            context.ui.router.navigate({
              type: "plugin",
              name: pitaPageName,
              data: { sessionID: current.sessionID },
            })
          },
        },
      ],
      bindings: ["pita.open"],
    }))

    return unregister
  },
})
