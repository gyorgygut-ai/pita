const defaultKeybind = "<leader>p";
const isStrategyName = value => {
  switch (value) {
    case "sentence":
    case "apfel":
      return true;
    default:
      return false;
  }
};
export const parseOptions = options => {
  const strategy = options.strategy ?? "sentence";
  if (!isStrategyName(strategy)) {
    throw new Error(`unknown strategy: ${JSON.stringify(strategy)}`);
  }
  const keybind = options.keybind ?? defaultKeybind;
  if (typeof keybind !== "string" || keybind.trim().length === 0) {
    throw new Error(`invalid keybind: ${JSON.stringify(keybind)}`);
  }
  return {
    strategy,
    keybind
  };
};