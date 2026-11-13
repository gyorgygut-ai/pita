import { mkdir, readFile, rename, writeFile } from "node:fs/promises"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const [action, scope] = process.argv.slice(2)

if (!new Set(["register", "unregister"]).has(action) || !new Set(["local", "global"]).has(scope)) {
  throw new Error("Usage: node scripts/plugin-config.mjs <register|unregister> <local|global>")
}

const configRoot = resolve(
  process.env.XDG_CONFIG_HOME ?? join(process.env.HOME, ".config"),
  "opencode",
)
const target = resolve(
  scope === "local"
    ? join(root, ".opencode", "plugins", "pita")
    : join(configRoot, "plugins", "pita"),
)
const cliConfig = join(configRoot, "cli.json")

let config
try {
  config = JSON.parse(await readFile(cliConfig, "utf8"))
} catch (error) {
  if (error.code !== "ENOENT") {
    throw new Error(`Cannot read ${cliConfig}: ${error.message}`, { cause: error })
  }
}

if (config === undefined && action === "unregister") {
  process.stdout.write(`Pita ${scope} registration not found\n`)
} else {
  config ??= {}
  if (!Array.isArray(config.plugins ?? [])) {
    throw new Error(`${cliConfig}: plugins must be an array`)
  }

  const plugins = config.plugins ?? []
  const isPita = (entry) => {
    const value = typeof entry === "string" ? entry : entry?.package
    return value === "opencode-pita-plugin" ||
      (typeof value === "string" && resolve(value) === target)
  }
  const updatedPlugins = action === "register"
    ? [...plugins.filter((entry) => !isPita(entry)), target]
    : plugins.filter((entry) => !isPita(entry))

  if (action === "unregister" && updatedPlugins.length === plugins.length) {
    process.stdout.write(`Pita ${scope} registration not found\n`)
  } else {
    config.plugins = updatedPlugins
    await mkdir(dirname(cliConfig), { recursive: true })
    const temporary = `${cliConfig}.${process.pid}.tmp`
    await writeFile(temporary, `${JSON.stringify(config, null, 2)}\n`)
    await rename(temporary, cliConfig)
    process.stdout.write(`Pita ${scope} ${action === "register" ? "registered" : "unregistered"}\n`)
  }
}
