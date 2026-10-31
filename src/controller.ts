import { createSignal } from "solid-js"
import { composeReply } from "./compose.js"
import { nextIndex, prevIndex, toggleSelected } from "./selection.js"
import type { Segment } from "./segment.js"
import type { SubmissionStrategy } from "./strategies/submission.js"

export type PitaScreen = "select" | "compose"

export type PitaControllerDeps = {
  readonly message: string
  readonly segments: readonly Segment[]
  readonly close: () => void
  readonly submit: SubmissionStrategy
}

export type PitaController = {
  readonly message: () => string
  readonly segments: () => readonly Segment[]
  readonly screen: () => PitaScreen
  readonly highlight: () => number
  readonly selected: () => readonly number[]
  readonly reply: () => string
  next: () => void
  prev: () => void
  toggle: () => void
  compose: () => void
  setReply: (text: string) => void
  submit: (text: string) => void
  back: () => void
}

export const createPitaController = (deps: PitaControllerDeps): PitaController => {
  const [screen, setScreen] = createSignal<PitaScreen>("select")
  const [highlight, setHighlight] = createSignal(-1)
  const [selected, setSelected] = createSignal<readonly number[]>([])
  const [reply, setReply] = createSignal("")

  const next = (): void => {
    setHighlight(nextIndex(highlight(), deps.segments.length))
  }

  const prev = (): void => {
    setHighlight(prevIndex(highlight(), deps.segments.length))
  }

  const toggle = (): void => {
    if (highlight() >= 0) {
      setSelected(toggleSelected(selected(), highlight()))
    }
  }

  const compose = (): void => {
    setReply(composeReply(deps.message, deps.segments, selected()))
    setScreen("compose")
  }

  const submit = (text: string): void => {
    void deps.submit(text)
  }

  const back = (): void => {
    if (screen() === "compose") {
      setScreen("select")
      return
    }
    deps.close()
  }

  return {
    message: () => deps.message,
    segments: () => deps.segments,
    screen,
    highlight,
    selected,
    reply,
    next,
    prev,
    toggle,
    compose,
    setReply,
    submit,
    back,
  }
}
