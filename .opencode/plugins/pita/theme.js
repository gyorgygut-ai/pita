const onHighlight = (theme, mode) => mode === "dark" ? theme.hue.neutral[100] : theme.hue.neutral[900];
export const pitaTheme = (theme, mode) => ({
    highlighted: { background: theme.hue.accent[400], foreground: onHighlight(theme, mode) },
    selected: { background: theme.hue.interactive[500], foreground: onHighlight(theme, mode) },
    text: theme.text.base,
    muted: theme.text.muted,
    border: theme.border.base,
});
