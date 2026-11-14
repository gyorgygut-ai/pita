import { RGBA } from "@opentui/core";
const transparent = RGBA.fromInts(0, 0, 0, 0);
export const pitaTheme = palette => ({
  highlighted: {
    foreground: palette.accent
  },
  selected: {
    background: palette.primary,
    foreground: palette.onPrimary
  },
  transparent,
  text: palette.text,
  muted: palette.muted,
  border: palette.border
});