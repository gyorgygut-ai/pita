export const nextIndex = (current: number, count: number): number => {
  if (count <= 0) {
    return -1
  }
  return current < 0 ? 0 : (current + 1) % count
}

export const prevIndex = (current: number, count: number): number => {
  if (count <= 0) {
    return -1
  }
  return current < 0 ? count - 1 : (current - 1 + count) % count
}

export const isSelected = (selected: readonly number[], index: number): boolean =>
  selected.includes(index)

export const toggleSelected = (selected: readonly number[], index: number): readonly number[] =>
  isSelected(selected, index)
    ? selected.filter((item) => item !== index)
    : [...selected, index].sort((left, right) => left - right)
