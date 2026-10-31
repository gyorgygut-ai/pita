import type { Segment } from "./segment.js"

export type LayoutRun = {
  readonly text: string
  readonly segment: number | null
}

export type LayoutRuns = (
  message: string,
  segments: readonly Segment[]
) => LayoutRun[]

export const layoutRuns: LayoutRuns = (message, segments) => {
  const runs: LayoutRun[] = []
  let cursor = 0
  segments.forEach((segment, index) => {
    if (segment.start > cursor) {
      runs.push({ text: message.slice(cursor, segment.start), segment: null })
    }
    runs.push({ text: message.slice(segment.start, segment.end), segment: index })
    cursor = segment.end
  })
  if (cursor < message.length) {
    runs.push({ text: message.slice(cursor), segment: null })
  }
  return runs
}
