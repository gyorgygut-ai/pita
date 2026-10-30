import { For, Show, createEffect, onMount } from "solid-js"
import { SyntaxStyle } from "@opentui/core"
import type { RGBA, ScrollBoxRenderable, TextareaRenderable } from "@opentui/core"
import type { JSX } from "@opentui/solid"
import { quotedRanges } from "./compose.js"
import type { PitaController } from "./controller.js"
import { isSelected } from "./selection.js"
import type { PitaTheme } from "./theme.js"

export type SelectScreenProps = {
  readonly controller: PitaController
  readonly theme: () => PitaTheme
}

const background = (
  theme: PitaTheme,
  selected: boolean,
  highlighted: boolean
): RGBA | undefined => {
  if (selected) {
    return theme.selected.background
  }
  if (highlighted) {
    return theme.highlighted.background
  }
  return undefined
}

const foreground = (theme: PitaTheme, selected: boolean, highlighted: boolean): RGBA => {
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
  let scroll: ScrollBoxRenderable | undefined

  createEffect(() => {
    const index = props.controller.highlight()
    if (index >= 0) {
      scroll?.scrollChildIntoView(`pita-segment-${index}`)
    }
  })

  return (
    <box flexDirection="column" flexGrow={1}>
      <box height={1}>
        <text fg={props.theme().muted}>
          Up and Down highlight, Space toggles, Enter composes, Esc closes
        </text>
      </box>
      <scrollbox
        flexGrow={1}
        minHeight={0}
        stickyScroll
        ref={(value) => {
          scroll = value
        }}
      >
        <For each={props.controller.segments()}>
          {(segment, index) => (
            <box
              id={`pita-segment-${index()}`}
              backgroundColor={background(
                props.theme(),
                isSelected(props.controller.selected(), index()),
                props.controller.highlight() === index()
              )}
            >
              <text
                fg={foreground(
                  props.theme(),
                  isSelected(props.controller.selected(), index()),
                  props.controller.highlight() === index()
                )}
              >
                {props.controller.message().slice(segment.start, segment.end)}
              </text>
            </box>
          )}
        </For>
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

export const ComposeScreen: ComposeScreen = (props) => {
  let node: TextareaRenderable | undefined

  onMount(() => {
    if (node === undefined) {
      return
    }
    const style = SyntaxStyle.fromStyles({
      "pita-selected": {
        fg: props.theme().selected.foreground,
        bg: props.theme().selected.background,
      },
    })
    const styleId = style.resolveStyleId("pita-selected")
    if (styleId === null) {
      return
    }
    node.syntaxStyle = style
    for (const range of quotedRanges(props.controller.reply())) {
      node.extmarks.create({ start: range.start, end: range.end, styleId })
    }
  })

  return (
    <box flexDirection="column">
      <text fg={props.theme().muted}>Enter sends, Esc returns to the selection</text>
      <textarea
        ref={(value) => {
          node = value
          props.editor(value)
        }}
        focused
        initialValue={props.controller.reply()}
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

export const PitaShell: PitaShell = (props) => (
  <box
    flexDirection="column"
    padding={1}
    borderStyle="single"
    borderColor={props.theme().border}
  >
    <Show when={props.controller.screen() === "select"}>
      <SelectScreen controller={props.controller} theme={props.theme} />
    </Show>
    <Show when={props.controller.screen() === "compose"}>
      <ComposeScreen {...props} />
    </Show>
  </box>
)
