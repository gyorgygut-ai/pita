import type { StrategyName } from "../strategies/index.js"

export type PitaOptions = {
  readonly strategy: StrategyName
  readonly keybind: string
}

export type ParseOptions = (options: Readonly<Record<string, unknown>>) => PitaOptions

const defaultKeybind = "<leader>p"

const isStrategyName = (value: unknown): value is StrategyName => {
  switch (value) {
    case "regex":
      return true
    default:
      return false
  }
}

export const parseOptions: ParseOptions = (options) => {
  const strategy = options.strategy ?? "regex"
  if (!isStrategyName(strategy)) {
    throw new Error(`unknown strategy: ${JSON.stringify(strategy)}`)
  }
  const keybind = options.keybind ?? defaultKeybind
  if (typeof keybind !== "string" || keybind.trim().length === 0) {
    throw new Error(`invalid keybind: ${JSON.stringify(keybind)}`)
  }
  return { strategy, keybind }
}
