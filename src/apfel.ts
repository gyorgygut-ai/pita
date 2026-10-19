import type { ApfelRunner } from "./strategies/llm-apfel.js"

export const apfel: ApfelRunner = async () =>
  JSON.stringify({ content: "" })