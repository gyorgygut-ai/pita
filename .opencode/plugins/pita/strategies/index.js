import { apfelStrategy } from "./llm-apfel.js";
import { sentenceStrategy } from "./sentence.js";
export const resolveStrategy = (name, deps) => {
  if (name === "apfel") {
    return apfelStrategy(deps.runApfel);
  }
  return sentenceStrategy;
};