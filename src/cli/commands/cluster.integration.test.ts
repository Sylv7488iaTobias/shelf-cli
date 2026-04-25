import { describe, it, expect } from "vitest";
import { Command } from "commander";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { registerClusterCommand } from "./cluster";
import { Bookmark } from "../../store/bookmarkStore";

function makeTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "shelf-cluster-int-"));
}

function seedStore(dir: string, bookmarks: Partial<Bookmark>[]): string {
  const storePath = path.join(dir, "bookmarks.json");
  const full = bookmarks.map((b, i) => ({
    id: `id-${i}`,
    name: b.name ?? `Bookmark ${i}`,
    url: b.url ?? "https://example.com",
    tags: b.tags ?? [],
    createdAt: new Date().toISOString(),
  }));
  fs.writeFileSync(storePath, JSON.stringify({ bookmarks: full }));
  return storePath;
}

describe("cluster integration", () => {
  it("clusters by domain end-to-end", () => {
    const dir = makeTempDir();
    const storePath = seedStore(dir, [
      { url: "https://github.com/a", name: "A" },
      { url: "https://github.com/b", name: "B" },
      { url: "https://gitlab.com/c", name: "C" },
    ]);

    const logs: string[] = [];
    const spy = (msg: string) => logs.push(msg);
    const origLog = console.log;
    console.log = spy;

    const program = new Command();
    program.exitOverride();
    registerClusterCommand(program);
    program.parse(["node", "shelf", "cluster", "--store", storePath]);

    console.log = origLog;

    const output = logs.join("\n");
    expect(output).toContain("github.com");
    expect(output).toContain("gitlab.com");
    expect(output).toContain("(2)");
  });

  it("filters clusters by min size", () => {
    const dir = makeTempDir();
    const storePath = seedStore(dir, [
      { url: "https://github.com/a" },
      { url: "https://github.com/b" },
      { url: "https://solo.io/x" },
    ]);

    const logs: string[] = [];
    const origLog = console.log;
    console.log = (msg: string) => logs.push(msg);

    const program = new Command();
    program.exitOverride();
    registerClusterCommand(program);
    program.parse([
      "node", "shelf", "cluster",
      "--store", storePath,
      "--min", "2",
    ]);

    console.log = origLog;

    const output = logs.join("\n");
    expect(output).toContain("github.com");
    expect(output).not.toContain("solo.io");
  });

  it("clusters by tag end-to-end", () => {
    const dir = makeTempDir();
    const storePath = seedStore(dir, [
      { url: "https://a.com", tags: ["dev"] },
      { url: "https://b.com", tags: ["dev", "tools"] },
      { url: "https://c.com", tags: [] },
    ]);

    const logs: string[] = [];
    const origLog = console.log;
    console.log = (msg: string) => logs.push(msg);

    const program = new Command();
    program.exitOverride();
    registerClusterCommand(program);
    program.parse(["node", "shelf", "cluster", "--by", "tag", "--store", storePath]);

    console.log = origLog;

    const output = logs.join("\n");
    expect(output).toContain("[dev]");
    expect(output).toContain("[untagged]");
  });
});
