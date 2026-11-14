import type { Segment } from "../core/segment.js"
import type { Strategy } from "./index.js"

type Line = Segment

const trimSegment = (message: string, segment: Segment): Segment => {
  const text = message.slice(segment.start, segment.end)
  const leading = text.match(/^\s*/)?.[0].length ?? 0
  const trailing = text.match(/\s*$/)?.[0].length ?? 0
  return { start: segment.start + leading, end: segment.end - trailing }
}

const linesIn = (message: string, start: number, end: number): Line[] => {
  const lines: Line[] = []
  let cursor = start
  while (cursor < end) {
    const newline = message.indexOf("\n", cursor)
    const lineEnd = newline === -1 || newline >= end ? end : newline
    lines.push({ start: cursor, end: lineEnd })
    cursor = lineEnd + 1
  }
  return lines
}

const splitSentences = (message: string, block: Segment): Segment[] => {
  const text = message.slice(block.start, block.end)
  const result: Segment[] = []
  let start = block.start

  for (const boundary of text.matchAll(/(?<=[.!?])(?=\s+)/g)) {
    const relative = boundary.index
    if (relative === undefined) {
      continue
    }
    const end = block.start + relative
    const sentence = trimSegment(message, { start, end })
    if (sentence.start < sentence.end) {
      result.push(sentence)
    }
    start = end
    while (start < block.end && /\s/.test(message[start] ?? "")) {
      start += 1
    }
  }

  const final = trimSegment(message, { start, end: block.end })
  if (final.start < final.end) {
    result.push(final)
  }
  return result
}

const splitList = (message: string, lines: readonly Line[]): Segment[] => {
  const segments: Segment[] = []
  let itemStart: number | undefined
  let itemEnd: number | undefined
  let proseStart: number | undefined
  let proseEnd: number | undefined

  const finishItem = (): void => {
    if (itemStart !== undefined && itemEnd !== undefined) {
      segments.push(trimSegment(message, { start: itemStart, end: itemEnd }))
      itemStart = undefined
      itemEnd = undefined
    }
  }
  const finishProse = (): void => {
    if (proseStart !== undefined && proseEnd !== undefined) {
      segments.push(...splitSentences(message, { start: proseStart, end: proseEnd }))
      proseStart = undefined
      proseEnd = undefined
    }
  }

  for (const line of lines) {
    const text = message.slice(line.start, line.end)
    const isItem = /^ {0,3}(?:[-*+]|\d+[.)])[ \t]+/.test(text)
    if (isItem) {
      finishProse()
      finishItem()
      itemStart = line.start
      itemEnd = line.end
    } else if (itemStart !== undefined && /^ {2,}\S/.test(text)) {
      itemEnd = line.end
    } else {
      finishItem()
      proseStart ??= line.start
      proseEnd = line.end
    }
  }

  finishItem()
  finishProse()
  return segments
}

const isHeadingLine = (text: string): boolean =>
  /^ {0,3}#{1,6}(?:\s|$)/.test(text) || /^\p{Extended_Pictographic}/u.test(text)

const segmentBlock = (message: string, block: Segment): Segment[] => {
  const text = message.slice(block.start, block.end)
  const lines = linesIn(message, block.start, block.end)

  if (/^ {0,3}(?:```|~~~)/.test(text) || /^ {0,3}>/.test(text)) {
    return [trimSegment(message, block)]
  }
  if (lines.some((line) => isHeadingLine(message.slice(line.start, line.end)))) {
    const segments: Segment[] = []
    let proseStart: number | undefined
    let proseEnd: number | undefined
    const finishProse = (): void => {
      if (proseStart !== undefined && proseEnd !== undefined) {
        segments.push(...segmentBlock(message, { start: proseStart, end: proseEnd }))
        proseStart = undefined
        proseEnd = undefined
      }
    }
    for (const line of lines) {
      if (isHeadingLine(message.slice(line.start, line.end))) {
        finishProse()
        segments.push(trimSegment(message, line))
      } else {
        proseStart ??= line.start
        proseEnd = line.end
      }
    }
    finishProse()
    return segments
  }
  if (/^ {0,3}(?:[-*_][ \t]*){3,}$/.test(text)) {
    return [trimSegment(message, block)]
  }
  if (lines.some((line) => /^ {0,3}(?:[-*+]|\d+[.)])[ \t]+/.test(message.slice(line.start, line.end)))) {
    return splitList(message, lines)
  }
  return splitSentences(message, block)
}

export const regexStrategy: Strategy = (message: string) => {
  const segments: Segment[] = []
  let blockStart: number | undefined
  let blockEnd: number | undefined
  let cursor = 0

  while (cursor <= message.length) {
    const newline = message.indexOf("\n", cursor)
    const lineEnd = newline === -1 ? message.length : newline
    const line = message.slice(cursor, lineEnd)
    const blank = line.trim().length === 0

    if (blank) {
      if (blockStart !== undefined && blockEnd !== undefined) {
        const block = { start: blockStart, end: blockEnd }
        segments.push(...segmentBlock(message, block))
      }
      blockStart = undefined
      blockEnd = undefined
    } else {
      blockStart ??= cursor
      blockEnd = lineEnd
    }

    if (newline === -1) {
      break
    }
    cursor = newline + 1
  }

  if (blockStart !== undefined && blockEnd !== undefined) {
    segments.push(...segmentBlock(message, { start: blockStart, end: blockEnd }))
  }

  return Promise.resolve(segments.filter((segment) => segment.start < segment.end))
}
