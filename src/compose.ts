import type { Segment } from "./segment"

export type ComposeReply = (
  message: string,
  segments: readonly Segment[],
  selected: readonly number[]
) => string

export const composeReply: ComposeReply = () => {
  throw new Error("not implemented")
}
