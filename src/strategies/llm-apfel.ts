import type { Segment } from "../segment"
import type { Strategy } from "./index"

export type ApfelRunner = (prompt: string) => Promise<string>

export type ApfelStrategy = (runApfel: ApfelRunner) => Strategy

export type SegmentPrompt = (message: string) => string

export const segmentPrompt: SegmentPrompt = (message) =>
  [
    "Split the message below into logical segments a reader may quote.",
    "Answer with the segments only, one per line, copied verbatim from the message.",
    "Do not number them, do not add quotation marks, do not add any other text.",
    "Message:",
    "",
    message,
  ].join("\n")

export type MapDecision = (message: string, decision: string) => Segment[]

export const mapDecision: MapDecision = (message, decision) => {
  const segments: Segment[] = []
  let cursor = 0
  for (const line of decision.split("\n")) {
    const text = line.trim()
    if (text.length === 0) {
      continue
    }
    const start = message.indexOf(text, cursor)
    if (start < 0) {
      continue
    }
    segments.push({ start, end: start + text.length })
    cursor = start + text.length
  }
  return segments
}

export type ParseApfelOutput = (stdout: string) => string

export const parseApfelOutput: ParseApfelOutput = (stdout) => {
  const envelope: { content?: string } = JSON.parse(stdout)
  return envelope.content ?? ""
}

export const apfelStrategy: ApfelStrategy = (runApfel) => (message) =>
  runApfel(segmentPrompt(message)).then((stdout) =>
    mapDecision(message, parseApfelOutput(stdout))
  )
