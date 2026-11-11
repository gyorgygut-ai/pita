import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, describe, expect, it } from "vitest"
import { installOpenCodePlugin } from "../../scripts/opencode-bundle.mjs"

const temporaryDirectories: string[] = []

const temporaryDirectory = async (): Promise<string> => {
  const directory = await mkdtemp(join(tmpdir(), "pita-bundle-test-"))
  temporaryDirectories.push(directory)
  return directory
}

const setupBundleFixture = async (config: object) => {
  const root = await temporaryDirectory()
  const dist = join(root, "dist")
  const plugin = join(root, "plugins", "pita")
  const cliConfig = join(root, "cli.json")
  await writeFile(cliConfig, JSON.stringify(config))
  await import("node:fs/promises").then(({ mkdir }) => mkdir(join(dist, "hosts", "opencode"), { recursive: true }))
  await writeFile(join(dist, "hosts", "opencode", "tui.js"), "export default {}")
  await writeFile(join(dist, "core.js"), "export const shared = true")
  return { dist, plugin, cliConfig }
}

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })))
})

describe("installOpenCodePlugin", () => {
  it("stages a package with an exported compiled TUI entry and registers it", async () => {
    const fixture = await setupBundleFixture({ theme: { name: "aura" } })
    await installOpenCodePlugin(fixture)
    const manifest = JSON.parse(await readFile(join(fixture.plugin, "package.json"), "utf8"))
    expect(manifest.exports["./tui"]).toBe("./hosts/opencode/tui.js")
    expect(await readFile(join(fixture.plugin, manifest.exports["./tui"]), "utf8")).toContain("export default")
    expect(manifest.dependencies["@opencode/plugin"]).toBe("2.0.23")
    expect(JSON.parse(await readFile(fixture.cliConfig, "utf8")).plugins).toEqual([fixture.plugin])
  })

  it("preserves existing CLI plugins and does not duplicate Pita registration", async () => {
    const fixture = await setupBundleFixture({ plugins: ["./plugins/other"] })
    const plugin = await readFile(join(fixture.dist, "hosts", "opencode", "tui.js"), "utf8")
    await installOpenCodePlugin(fixture)
    expect(await readFile(join(fixture.plugin, "hosts", "opencode", "tui.js"), "utf8")).toBe(plugin)
    expect(JSON.parse(await readFile(fixture.cliConfig, "utf8")).plugins).toEqual(["./plugins/other", fixture.plugin])
  })

  it("replaces the previous Pita target while retaining unrelated plugins", async () => {
    const fixture = await setupBundleFixture({ plugins: ["./plugins/other"] })
    const oldPlugin = join(fixture.plugin, "..", "pita-old")
    await installOpenCodePlugin({ ...fixture, managedPlugins: [oldPlugin] })
    expect(JSON.parse(await readFile(fixture.cliConfig, "utf8")).plugins).toEqual(["./plugins/other", fixture.plugin])
  })
})
