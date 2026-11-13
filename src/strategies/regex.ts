import type { Segment } from "../core/segment.js"
import type { Strategy } from "./index.js"

const LONG_THRESHOLD = 120
const STRUCTURE_PATTERN =
  /^(?: {0,3}#{1,6}[^\n]*$| {0,3}(?:[-*+])[ \t]+[^\n]*(?:\n {0,3}(?:[-*+])[ \t]+[^\n]*)*$| {0,3}>[^\n]*$| {0,3}```[\s\S]*?```$| {0,3}(?:[-*_])(?:[ \t]*[-*_]){2,}[^\n]*$| {0,3}\d+[.)][ \t]+[^\n]*(?:\n(?: {0,3}\d+[.)][ \t]+[^\n]*|[^\n]+))*)/gm

const splitRange = (message: string, start: number, end: number): Segment[] => {
  if (start >= end) {
    return []
  }
  if (end - start <= LONG_THRESHOLD) {
    return [{ start, end }]
  }

  const lines = Array.from(message.slice(start, end).matchAll(/[^\n]*\n|[^\n]+$/g)).map((match) => ({
    start: start + (match.index ?? 0),
    end: start + (match.index ?? 0) + match[0].length,
  }))
  const grouped = lines.reduce<{
    segments: Segment[]
    start: number | undefined
    end: number | undefined
    length: number
  }>(
    (group, line) => {
      if (
        group.start !== undefined &&
        group.end !== undefined &&
        group.length > 0 &&
        group.length + line.end - line.start > LONG_THRESHOLD
      ) {
        const text = message.slice(group.start, group.end)
        const sentenceBoundary = Array.from(text.matchAll(/(?<=[.!?])(?=\s)/g))
          .map((match) => match.index)
          .find((index) => index > 0 && index < text.length)

        if (sentenceBoundary !== undefined) {
          const chunkStart = group.start + sentenceBoundary
          return {
            segments: [...group.segments, { start: group.start, end: chunkStart }],
            start: chunkStart,
            end: line.end,
            length: line.end - chunkStart,
          }
        }

        return {
          segments: [...group.segments, { start: group.start, end: group.end }],
          start: line.start,
          end: line.end,
          length: line.end - line.start,
        }
      }

      return {
        ...group,
        start: group.start ?? line.start,
        end: line.end,
        length: group.length + line.end - line.start,
      }
    },
    { segments: [], start: undefined, end: undefined, length: 0 },
  )

  return grouped.start === undefined || grouped.end === undefined
    ? grouped.segments
    : [...grouped.segments, { start: grouped.start, end: grouped.end }]
}

const trimSegment = (message: string, segment: Segment): Segment => {
  const text = message.slice(segment.start, segment.end)
  const leading = text.match(/^\s*/)?.[0].length ?? 0
  const trailing = text.match(/\s*$/)?.[0].length ?? 0
  return { start: segment.start + leading, end: segment.end - trailing }
}

export const regexStrategy: Strategy = (message: string) => {
  const matches = Array.from(message.matchAll(STRUCTURE_PATTERN)).map((match) => ({
    start: match.index ?? 0,
    end: (match.index ?? 0) + match[0].length,
  }))

  const result = matches.reduce<{ segments: Segment[]; cursor: number }>(
    (state, match) => {
      if (match.start < state.cursor) {
        return state
      }
      return {
        segments: [
          ...state.segments,
          ...splitRange(message, state.cursor, match.start),
          match,
        ],
        cursor: match.end,
      }
    },
    { segments: [], cursor: 0 },
  )

  return Promise.resolve(
    [...result.segments, ...splitRange(message, result.cursor, message.length)]
      .map((segment) => trimSegment(message, segment))
      .filter((segment) => segment.start < segment.end && message.slice(segment.start, segment.end).trim().length > 0),
  )
}
