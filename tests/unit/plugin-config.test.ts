import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { afterEach, describe, expect, it } from "vitest"
import { execFileSync } from "node:child_process"

const root = resolve(fileURLToPath(new URL("../..", import.meta.url)))
const script = join(root, "scripts", "plugin-config.mjs")
const localPlugin = join(root, ".opencode", "plugins", "pita")
const temporaryDirectories: string[] = []

const setupConfig = async (plugins: unknown[]) => {
  const xdg = await mkdtemp(join(tmpdir(), "pita-plugin-config-test-"))
  temporaryDirectories.push(xdg)
  const configDirectory = join(xdg, "opencode")
  await import("node:fs/promises").then(({ mkdir }) => mkdir(configDirectory, { recursive: true }))
  const config = join(configDirectory, "cli.json")
  await writeFile(config, JSON.stringify({ theme: "aura", plugins }))
  return { xdg, config }
}

const run = (xdg: string, action: string, scope: string): void => {
  execFileSync(process.execPath, [script, action, scope], {
    env: { ...process.env, XDG_CONFIG_HOME: xdg },
  })
}

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })))
})

describe("plugin config commands", () => {
  it("registers the local path without changing unrelated CLI config", async () => {
    const fixture = await setupConfig(["./plugins/other"])

    run(fixture.xdg, "register", "local")

    expect(JSON.parse(await readFile(fixture.config, "utf8"))).toEqual({
      theme: "aura",
      plugins: ["./plugins/other", localPlugin],
    })
  })

  it("unregisters the local path without changing unrelated CLI config", async () => {
    const fixture = await setupConfig(["./plugins/other", localPlugin])

    run(fixture.xdg, "unregister", "local")

    expect(JSON.parse(await readFile(fixture.config, "utf8"))).toEqual({
      theme: "aura",
      plugins: ["./plugins/other"],
    })
  })

  it("registers the global path without changing unrelated CLI config", async () => {
    const fixture = await setupConfig(["./plugins/other"])

    run(fixture.xdg, "register", "global")

    expect(JSON.parse(await readFile(fixture.config, "utf8"))).toEqual({
      theme: "aura",
      plugins: ["./plugins/other", join(fixture.xdg, "opencode", "plugins", "pita")],
    })
  })

  it("unregisters the global path without changing unrelated CLI config", async () => {
    const fixture = await setupConfig(["./plugins/other"])
    const globalPlugin = join(fixture.xdg, "opencode", "plugins", "pita")
    await writeFile(fixture.config, JSON.stringify({ theme: "aura", plugins: ["./plugins/other", globalPlugin] }))

    run(fixture.xdg, "unregister", "global")

    expect(JSON.parse(await readFile(fixture.config, "utf8"))).toEqual({
      theme: "aura",
      plugins: ["./plugins/other"],
    })
  })
})
