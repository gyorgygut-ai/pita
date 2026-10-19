import type { Segment } from "./segment"

export type ComposeReply = (
  message: string,
  segments: readonly Segment[],
  selected: readonly number[]
) => string

export const composeReply: ComposeReply = (message, segments, selected) => {
  const quoted = selected.map(
    (index) => `"${message.slice(segments[index].start, segments[index].end)}"`
  )
  return quoted.join("\n\n\n")
}
