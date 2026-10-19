export type NextIndex = (current: number, count: number) => number
export type PrevIndex = (current: number, count: number) => number
export type ToggleSelected = (selected: readonly number[], index: number) => readonly number[]
export type IsSelected = (selected: readonly number[], index: number) => boolean

export const nextIndex: NextIndex = () => {
  throw new Error("not implemented")
}

export const prevIndex: PrevIndex = () => {
  throw new Error("not implemented")
}

export const toggleSelected: ToggleSelected = () => {
  throw new Error("not implemented")
}

export const isSelected: IsSelected = () => {
  throw new Error("not implemented")
}
