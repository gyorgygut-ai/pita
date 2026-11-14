import type { Segment } from "./segment.js"

export type ComposeReply = (
  message: string,
  segments: readonly Segment[],
  selected: readonly number[]
) => string

export const composeReply: ComposeReply = (message, segments, selected) => {
  const quoted = selected.map(
    (index) => `"${message.slice(segments[index].start, segments[index].end)}"`
  )
  return quoted.length === 0 ? "" : `${quoted.join("\n\n\n")}\n\n\n`
}

export type QuotedRange = {
  readonly start: number
  readonly end: number
}

export type QuotedRanges = (reply: string) => QuotedRange[]

export const quotedRanges: QuotedRanges = (reply) => {
  const ranges: QuotedRange[] = []
  for (const match of reply.matchAll(/"[^"]*"/g)) {
    const start = match.index ?? 0
    ranges.push({ start, end: start + match[0].length })
  }
  return ranges
}
