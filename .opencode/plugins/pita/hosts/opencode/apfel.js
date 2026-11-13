import { execFile } from "node:child_process";
import { promisify } from "node:util";
export const apfelArgs = prompt => ["--output", "json", "--no-color", prompt];
export const createApfel = exec => prompt => exec("apfel", apfelArgs(prompt));
const run = async (file, args) => {
  const result = await promisify(execFile)(file, [...args]);
  return result.stdout;
};
export const apfel = createApfel(run);