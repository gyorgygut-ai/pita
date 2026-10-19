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

const onHighlight = (theme: ResolvedTheme, mode: "dark" | "light"): RGBA =>
  mode === "dark" ? theme.hue.neutral[100] : theme.hue.neutral[900]

export const pitaTheme: ResolvePitaTheme = (theme, mode) => ({
  highlighted: { background: theme.hue.accent[400], foreground: onHighlight(theme, mode) },
  selected: { background: theme.hue.interactive[500], foreground: onHighlight(theme, mode) },
  text: theme.text.base,
  muted: theme.text.muted,
  border: theme.border.base,
})
