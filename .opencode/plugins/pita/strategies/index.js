import { apfelStrategy } from "./llm-apfel.js";
import { regexStrategy } from "./regex.js";
export const resolveStrategy = (name, deps) => {
  if (name === "apfel") {
    return apfelStrategy(deps.runApfel);
  }
  return regexStrategy;
};
export { regexStrategy };