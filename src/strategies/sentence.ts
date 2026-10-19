import type { Segment } from "../segment"
import type { Strategy } from "./index"

const sentencePattern = /[^.!?…\n]+[.!?…]*/g

export type SplitSentences = (message: string) => Segment[]

export const splitSentences: SplitSentences = (message) => {
  const segments: Segment[] = []
  for (const match of message.matchAll(sentencePattern)) {
    const raw = match[0]
    const text = raw.trim()
    if (text.length > 0) {
      const start = (match.index ?? 0) + raw.indexOf(text)
      segments.push({ start, end: start + text.length })
    }
  }
  return segments
}

export const sentenceStrategy: Strategy = (message) => Promise.resolve(splitSentences(message))
