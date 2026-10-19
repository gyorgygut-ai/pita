import { execFileSync } from "node:child_process"
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { homedir } from "node:os"
import path from "node:path"
import { fileURLToPath } from "node:url"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const project = JSON.parse(readFileSync(path.join(root, "package.json"), "utf8"))

const argument = process.argv.find((value) => value.startsWith("--target="))
const requested = argument?.slice("--target=".length) ?? ""
if (!requested) {
  console.error("bundle: --target=<dir> is required")
  process.exit(1)
}

const expanded =
  requested === "~" ? homedir() :
  requested.startsWith("~/") ? path.join(homedir(), requested.slice(2)) :
  requested
const target = path.resolve(root, expanded)
if (target === root || target === path.parse(target).root) {
  console.error(`bundle: refusing to write to ${target}`)
  process.exit(1)
}

const run = (command, args) => {
  execFileSync(command, args, { cwd: root, stdio: "inherit" })
}

run("npm", ["run", "build"])

rmSync(target, { recursive: true, force: true })
mkdirSync(target, { recursive: true })
cpSync(path.join(root, "dist"), target, { recursive: true })
// pita is a TUI-only plugin: a server entrypoint would load it against the
// server context, where context.ui does not exist.
rmSync(path.join(target, "index.js"), { force: true })

writeFileSync(
  path.join(target, "package.json"),
  JSON.stringify(
    {
      name: `${project.name}-bundle`,
      version: project.version,
      type: "module",
      main: "tui.js",
      dependencies: {
        "@opencode/plugin": project.dependencies["@opencode/plugin"],
        "@opentui/core": project.devDependencies["@opentui/core"],
        "@opentui/solid": project.devDependencies["@opentui/solid"],
        "solid-js": "^1.9.0",
      },
    },
    null,
    2
  ) + "\n"
)

run("npm", ["install", "--omit=dev", "--no-package-lock", "--prefix", target])
