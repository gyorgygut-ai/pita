import type { JSX } from "@opentui/solid"
import type { Plugin } from "@opencode/plugin/tui"
import type { Strategy } from "./strategies"
import type { PitaTheme } from "./theme"

export type PitaDeps = {
  readonly theme: PitaTheme
  readonly strategy: Strategy
}

export type PitaScreenProps = {
  readonly context: Plugin.Context
} & PitaDeps

export type PitaScreen = (props: PitaScreenProps) => JSX.Element

export const selectScreen: PitaScreen = () => {
  throw new Error("not implemented")
}

export const composeScreen: PitaScreen = () => {
  throw new Error("not implemented")
}

export type PitaPage = {
  readonly name: string
  readonly render: () => JSX.Element
}

export type PitaPageFactory = (context: Plugin.Context, deps: PitaDeps) => PitaPage

export const pitaPage: PitaPageFactory = () => {
  throw new Error("not implemented")
}
