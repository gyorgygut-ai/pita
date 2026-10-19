import type { RGBA } from "@opentui/core"
import type { ResolvedTheme } from "@opencode/theme/tui"

export type HighlightStyle = {
  readonly background: RGBA
  readonly foreground: RGBA
}

export type PitaTheme = {
  readonly highlighted: HighlightStyle
  readonly selected: HighlightStyle
  readonly text: RGBA
  readonly muted: RGBA
  readonly border: RGBA
}

export type ResolvePitaTheme = (theme: ResolvedTheme, mode: "dark" | "light") => PitaTheme

export const pitaTheme: ResolvePitaTheme = () => {
  throw new Error("not implemented")
}
