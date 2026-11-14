import { describe, expect, it } from "vitest"
import { RGBA } from "@opentui/core"
import { resolveSegmentStyle } from "../../src/ui/screens"
import { pitaTheme } from "../../src/ui/theme"

const theme = pitaTheme({
  accent: RGBA.fromInts(1, 2, 3),
  primary: RGBA.fromInts(4, 5, 6),
  onPrimary: RGBA.fromInts(7, 8, 9),
  text: RGBA.fromInts(10, 11, 12),
  muted: RGBA.fromInts(13, 14, 15),
  border: RGBA.fromInts(16, 17, 18),
})

describe("resolveSegmentStyle", () => {
  it("uses normal text style when the segment is neither selected nor highlighted", () => {
    const style = resolveSegmentStyle(theme, false, false)
    expect([style.fg, style.bg]).toEqual([theme.text, theme.transparent])
  })

  it("uses selected foreground and background for a selected segment", () => {
    const style = resolveSegmentStyle(theme, true, false)
    expect([style.fg, style.bg]).toEqual([theme.selected.foreground, theme.selected.background])
  })

  it("uses highlighted foreground for a highlighted segment", () => {
    const style = resolveSegmentStyle(theme, false, true)
    expect([style.fg, style.bg]).toEqual([theme.highlighted.foreground, theme.transparent])
  })

  it("merges selected background with highlighted foreground for a selected highlight", () => {
    const style = resolveSegmentStyle(theme, true, true)
    expect([style.fg, style.bg]).toEqual([theme.highlighted.foreground, theme.selected.background])
  })
})
