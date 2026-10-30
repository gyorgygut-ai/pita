import type { RGBA } from "@opentui/core"

export type PitaStyle = {
  readonly background: RGBA
  readonly foreground: RGBA
}

export type PitaTheme = {
  readonly highlighted: PitaStyle
  readonly selected: PitaStyle
  readonly text: RGBA
  readonly muted: RGBA
  readonly border: RGBA
}

export type PitaPalette = {
  readonly accent: RGBA
  readonly primary: RGBA
  readonly onAccent: RGBA
  readonly onPrimary: RGBA
  readonly text: RGBA
  readonly muted: RGBA
  readonly border: RGBA
}

export type ResolvePitaTheme = (palette: PitaPalette) => PitaTheme

export const pitaTheme: ResolvePitaTheme = (palette) => ({
  highlighted: { background: palette.accent, foreground: palette.onAccent },
  selected: { background: palette.primary, foreground: palette.onPrimary },
  text: palette.text,
  muted: palette.muted,
  border: palette.border,
})
