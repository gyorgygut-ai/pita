import { cp, mkdir, readFile, rename, rm, writeFile } from "node:fs/promises"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..")

const runtimeDependencies = {
  "@opencode/plugin": "2.0.23",
  "@opentui/core": "0.5.14",
  "@opentui/solid": "0.5.14",
  "solid-js": "^1.9.0",
}

const packageManifest = {
  name: "opencode-pita-plugin",
  version: "0.0.0",
  type: "module",
  exports: { "./tui": "./hosts/opencode/tui.js" },
  dependencies: runtimeDependencies,
}

const registerCliPlugin = async (cliConfig, plugin, managedPlugins) => {
  await mkdir(dirname(cliConfig), { recursive: true })
  let config = {}
  try {
    config = JSON.parse(await readFile(cliConfig, "utf8"))
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw new Error(`Cannot parse ${cliConfig}: ${error.message}`, { cause: error })
    }
  }
  if (!Array.isArray(config.plugins ?? [])) {
    throw new Error(`${cliConfig}: plugins must be an array`)
  }
  const managed = new Set([plugin, ...managedPlugins].map((path) => resolve(path)))
  const isManaged = (entry) => {
    const value = typeof entry === "string" ? entry : entry?.package
    return value === "opencode-pita-plugin" || (typeof value === "string" && managed.has(resolve(value)))
  }
  config.plugins = [...(config.plugins ?? []).filter((entry) => !isManaged(entry)), plugin]
  const temporaryConfig = `${cliConfig}.${process.pid}.tmp`
  await writeFile(temporaryConfig, `${JSON.stringify(config, null, 2)}\n`)
  await rename(temporaryConfig, cliConfig)
}

export const installOpenCodePlugin = async ({ dist, plugin, cliConfig, managedPlugins = [] }) => {
  const source = resolve(dist)
  const destination = resolve(plugin)
  const entry = join(source, "hosts", "opencode", "tui.js")
  await readFile(entry)

  const staging = `${destination}.${process.pid}.staging`
  await rm(staging, { recursive: true, force: true })
  await mkdir(dirname(destination), { recursive: true })
  try {
    await cp(source, staging, { recursive: true })
    await writeFile(join(staging, "tui.js"), 'export { default } from "./hosts/opencode/tui.js"\n')
    await writeFile(join(staging, "package.json"), `${JSON.stringify(packageManifest, null, 2)}\n`)
    await rm(destination, { recursive: true, force: true })
    await rename(staging, destination)
    await registerCliPlugin(resolve(cliConfig), destination, managedPlugins)
  } catch (error) {
    await rm(staging, { recursive: true, force: true })
    throw error
  }
}

const bundle = async (scope) => {
  const global = scope === "global"
  if (!global && scope !== "local") {
    throw new Error("Usage: node scripts/opencode-bundle.mjs <local|global>")
  }
  const globalConfigRoot = resolve(process.env.XDG_CONFIG_HOME ?? join(process.env.HOME, ".config"), "opencode")
  const plugin = global ? join(globalConfigRoot, "plugins", "pita") : join(root, ".opencode", "plugins", "pita")
  const managedPlugins = [join(root, ".opencode", "plugins", "pita"), join(globalConfigRoot, "plugins", "pita")]
  await installOpenCodePlugin({
    dist: join(root, "dist"),
    plugin,
    cliConfig: join(globalConfigRoot, "cli.json"),
    managedPlugins,
  })
  process.stdout.write(`Installed Pita ${scope}: ${plugin}\n`)
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  bundle(process.argv[2]).catch((error) => {
    process.stderr.write(`${error.message}\n`)
    process.exitCode = 1
  })
}
