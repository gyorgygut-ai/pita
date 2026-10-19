export type NextIndex = (current: number, count: number) => number
export type PrevIndex = (current: number, count: number) => number
export type ToggleSelected = (selected: readonly number[], index: number) => readonly number[]
export type IsSelected = (selected: readonly number[], index: number) => boolean

export const nextIndex: NextIndex = (current, count) => {
  if (count === 0) {
    return -1
  }
  if (current < 0) {
    return 0
  }
  return (current + 1) % count
}

export const prevIndex: PrevIndex = (current, count) => {
  if (count === 0) {
    return -1
  }
  if (current < 0) {
    return count - 1
  }
  return (current - 1 + count) % count
}

export const toggleSelected: ToggleSelected = (selected, index) => {
  if (selected.includes(index)) {
    return selected.filter((value) => value !== index)
  }
  return [...selected, index].sort((left, right) => left - right)
}

export const isSelected: IsSelected = (selected, index) => selected.includes(index)
