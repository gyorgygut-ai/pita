import type { ResolvedTheme } from "@opencode/theme/tui"
import type { PitaTheme } from "./theme.js"
import { pitaTheme } from "./theme.js"

export type OpencodePitaTheme = (theme: ResolvedTheme, mode: "dark" | "light") => PitaTheme

export const opencodePitaTheme: OpencodePitaTheme = (theme, mode) =>
  pitaTheme({
    accent: theme.hue.accent[200],
    primary: theme.hue.interactive[200],
    onAccent: mode === "dark" ? theme.hue.neutral[100] : theme.hue.neutral[900],
    onPrimary: mode === "dark" ? theme.hue.neutral[100] : theme.hue.neutral[900],
    text: theme.text.base,
    muted: theme.text.muted,
    border: theme.border.base,
  })
