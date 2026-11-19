import type { Segment } from "../core/segment.js"
import type { Strategy } from "./index.js"

const trimSegment = (message: string, segment: Segment): Segment => {
  const text = message.slice(segment.start, segment.end)
  const leading = text.match(/^\s*/)?.[0].length ?? 0
  const trailing = text.match(/\s*$/)?.[0].length ?? 0
  return { start: segment.start + leading, end: segment.end - trailing }
}

const splitSentences = (message: string, block: Segment): Segment[] => {
  const text = message.slice(block.start, block.end)
  const segments: Segment[] = []
  let start = block.start

  for (const boundary of text.matchAll(/(?<=[.!?])(?=\s+)/g)) {
    const relative = boundary.index
    if (relative === undefined) {
      continue
    }

    const end = block.start + relative
    const sentence = trimSegment(message, { start, end })
    if (sentence.start < sentence.end) {
      segments.push(sentence)
    }
    start = end
    while (start < block.end && /\s/.test(message[start] ?? "")) {
      start += 1
    }
  }

  const final = trimSegment(message, { start, end: block.end })
  if (final.start < final.end) {
    segments.push(final)
  }
  return segments
}

export const regexStrategy: Strategy = (message: string) => {
  const segments: Segment[] = []
  const structure = /^ {0,3}(?:#{1,6}[ \t]+[^\n]*|(?:[-*+]|\d+[.)])[ \t]+[^\n]*|>[^\n]*|(?:[-*_][ \t]*){3,}|\p{Extended_Pictographic}[^\n]*)$/gmu
  let cursor = 0

  for (const match of message.matchAll(structure)) {
    const start = match.index ?? 0
    segments.push(...splitSentences(message, { start: cursor, end: start }))
    const segment = trimSegment(message, { start, end: start + match[0].length })
    if (segment.start < segment.end) {
      segments.push(segment)
    }
    cursor = start + match[0].length
  }

  segments.push(...splitSentences(message, { start: cursor, end: message.length }))
  return Promise.resolve(segments)
}
