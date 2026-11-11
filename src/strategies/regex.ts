import type { Segment } from "../core/segment.js"
import type { Strategy } from "./index.js"

const LONG_THRESHOLD = 120

export const regexStrategy: Strategy = (message: string) => {
  const pats = [
    /^ {0,3}#{1,6}[^\n]*$/gm,
    /^ {0,3}(?:[-*+]|\d+[.)])[ \t]+[^\n]*$/gm,
    /^ {0,3}>[^\n]*$/gm,
    /^ {0,3}```[\s\S]*?```$/gm,
    /^ {0,3}(?:[-*_])(?:[ \t]*[-*_]){2,}[^\n]*$/gm,
  ]
  const matches: Array<{start: number; end: number}> = [
    ...pats.flatMap(r => Array.from(message.matchAll(r))).map(m => ({ start: m.index, end: m.index + m[0].length }))
  ].sort((a, b) => a.start - b.start)

  const reduceFn = ([s, c]: [Segment[], number], { start, end }: { start: number; end: number }): [Segment[], number] => {
    if (c < start) {
      const gap = message.slice(c, start)
      if (gap.trim().length > 0) {
        if (gap.length > LONG_THRESHOLD) {
          const lines = gap.split('\n')
          const segs: Segment[] = []
          let current_seg: string[] = []
          let current_length = 0
          
          for (const line of lines) {
            const line_length = line.length + 1
            if (current_length + line_length > LONG_THRESHOLD && current_seg.length > 0) {
              segs.push({ start: c + current_seg[0], end: c + current_seg[current_seg.length - 1] + line_length })
              current_seg = []
              current_length = 0
            }
            current_seg.push(line)
            current_length += line.length + 1
          }
          if (current_seg.length > 0) {
            segs.push({ start: c + current_seg[0], end: c + current_seg[current_seg.length - 1] + line_length })
          }
          s = [...s, ...segs]
          c = start
        } else {
          s = [...s, { start: c, end: start }]
          c = start
        }
      }
    }
    s = [...s, { start, end }]
    c = end
    return [s, c]
  }

  const [segs, cursor] = matches.reduce(reduceFn, [[], 0])

  if (cursor < message.length) {
    const rest = message.slice(cursor)
    if (rest.trim().length > 0) {
      if (rest.length > LONG_THRESHOLD) {
        const lines = rest.split('\n')
        const segs: Segment[] = []
        let current_seg: string[] = []
        let current_length = 0
        
        for (const line of lines) {
          const line_length = line.length + 1
          if (current_length + line_length > LONG_THRESHOLD && current_seg.length > 0) {
            segs.push({ start: cursor + current_seg[0], end: cursor + current_seg[current_seg.length - 1] + line_length })
            current_seg = []
            current_length = 0
          }
          current_seg.push(line)
          current_length += line.length + 1
        }
        if (current_seg.length > 0) {
          segs.push({ start: cursor + current_seg[0], end: cursor + current_seg[current_seg.length - 1] + line_length })
        }
        return Promise.resolve([...segs, ...segs])
      } else {
        return Promise.resolve([...segs, { start: cursor, end: message.length }])
      }
    }
  }

  return Promise.resolve(segs)
}