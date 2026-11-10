import { For, createEffect, createMemo, createSignal } from "solid-js"
import { SyntaxStyle } from "@opentui/core"
import type { RGBA, TextareaRenderable } from "@opentui/core"
import type { JSX } from "@opentui/solid"
import { quotedRanges } from "../core/compose.js"
import type { PitaController } from "../core/controller.js"
import { layoutRuns } from "../core/layout.js"
import { isSelected } from "../core/selection.js"
import type { PitaTheme } from "./theme.js"

export type SelectScreenProps = {
  readonly controller: PitaController
  readonly theme: () => PitaTheme
}

const runBackground = (
  theme: PitaTheme,
  selected: boolean,
  highlighted: boolean
): RGBA => {
  if (selected) {
    return theme.selected.background
  }
  if (highlighted) {
    return theme.highlighted.background
  }
  return theme.transparent
}

const runForeground = (theme: PitaTheme, selected: boolean, highlighted: boolean): RGBA => {
  if (selected) {
    return theme.selected.foreground
  }
  if (highlighted) {
    return theme.highlighted.foreground
  }
  return theme.text
}

export type SelectScreen = (props: SelectScreenProps) => JSX.Element

export const SelectScreen: SelectScreen = (props) => {
  const runs = createMemo(() => layoutRuns(props.controller.message(), props.controller.segments()))

  return (
    <box flexDirection="column" flexGrow={1}>
      <box height={1}>
        <text fg={props.theme().muted}>
          Up and Down highlight, Space toggles, Enter composes, Esc closes
        </text>
      </box>
      <scrollbox flexGrow={1} minHeight={0} stickyScroll>
        <text wrapMode="word">
          <For each={runs()}>
            {(run) => {
              const selected = (): boolean =>
                run.segment !== null && isSelected(props.controller.selected(), run.segment)
              const highlighted = (): boolean =>
                run.segment !== null && props.controller.highlight() === run.segment
              return (
                <span
                  style={{
                    fg: runForeground(props.theme(), selected(), highlighted()),
                    bg: runBackground(props.theme(), selected(), highlighted()),
                  }}
                >
                  {run.text}
                </span>
              )
            }}
          </For>
        </text>
      </scrollbox>
    </box>
  )
}

export type ComposeScreenProps = {
  readonly controller: PitaController
  readonly theme: () => PitaTheme
  readonly editor: (node: TextareaRenderable) => void
}

export type ComposeScreen = (props: ComposeScreenProps) => JSX.Element

type SelectedStyle = {
  readonly id: number
}

export const ComposeScreen: ComposeScreen = (props) => {
  const [node, setNode] = createSignal<TextareaRenderable>()
  const [selectedStyle, setSelectedStyle] = createSignal<SelectedStyle>()

  createEffect(() => {
    const editor = node()
    const reply = props.controller.reply()
    if (editor === undefined) {
      return
    }
    let entry = selectedStyle()
    if (entry === undefined) {
      const style = SyntaxStyle.fromStyles({
        "pita-selected": {
          fg: props.theme().selected.foreground,
          bg: props.theme().selected.background,
        },
      })
      const id = style.resolveStyleId("pita-selected")
      if (id === null) {
        return
      }
      editor.syntaxStyle = style
      entry = { id }
      setSelectedStyle(entry)
    }
    editor.extmarks.clear()
    for (const range of quotedRanges(reply)) {
      editor.extmarks.create({ start: range.start, end: range.end, styleId: entry.id })
    }
  })

  return (
    <box flexDirection="column">
      <text fg={props.theme().muted}>Enter sends, Esc returns to the selection</text>
      <textarea
        ref={(value) => {
          setNode(value)
          props.editor(value)
        }}
        focused
        initialValue={props.controller.reply()}
        onContentChange={() => props.controller.setReply(node()?.plainText ?? "")}
      />
    </box>
  )
}

export type PitaShellProps = {
  readonly controller: PitaController
  readonly theme: () => PitaTheme
  readonly editor: (node: TextareaRenderable) => void
}

export type PitaShell = (props: PitaShellProps) => JSX.Element

export type PitaFrameProps = {
  readonly theme: () => PitaTheme
  readonly children: JSX.Element
}

export const PitaFrame = (props: PitaFrameProps): JSX.Element => (
  <box
    flexDirection="column"
    padding={1}
    borderStyle="single"
    borderColor={props.theme().border}
  >
    {props.children}
  </box>
)

export type ReplyResultScreenProps = { readonly text: string }

export const ReplyResultScreen = (props: ReplyResultScreenProps): JSX.Element => (
  <box flexDirection="column" flexGrow={1}>
    <text>Composed reply</text>
    <scrollbox flexGrow={1} minHeight={0}>
      <text wrapMode="word">{props.text}</text>
    </scrollbox>
  </box>
)

export const PitaShell: PitaShell = (props) => (
  <PitaFrame theme={props.theme}>
    {props.controller.screen() === "select" ? (
      <SelectScreen controller={props.controller} theme={props.theme} />
    ) : (
      <ComposeScreen {...props} />
    )}
  </PitaFrame>
)
