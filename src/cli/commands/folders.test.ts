import { Command } from "commander";
import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";
import { registerFoldersCommand } from "./folders";

async function makeTempDir(): Promise<string> {
  return fs.mkdtemp(path.join(os.tmpdir(), "shelf-folders-test-"));
}

async function makeStorePath(dir: string, bookmarks: object[]) {
  const storePath = path.join(dir, "bookmarks.json");
  await fs.writeFile(storePath, JSON.stringify({ bookmarks }));
  return storePath;
}

function makeProgram() {
  const program = new Command();
  program.exitOverride();
  registerFoldersCommand(program);
  return program;
}

describe("folders command", () => {
  let tmpDir: string;
  let consoleSpy: jest.SpyInstance;

  beforeEach(async () => {
    tmpDir = await makeTempDir();
    consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(async () => {
    consoleSpy.mockRestore();
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it("lists bookmarks grouped by folder", async () => {
    const storePath = await makeStorePath(tmpDir, [
      { name: "gh", url: "https://github.com", tags: ["folder:work", "dev"] },
      { name: "hn", url: "https://news.ycombinator.com", tags: ["folder:reading"] },
    ]);
    const program = makeProgram();
    await program.parseAsync(["node", "test", "folders", "--store", storePath]);
    const output = consoleSpy.mock.calls.map((c) => c[0]).join("\n");
    expect(output).toContain("work");
    expect(output).toContain("reading");
    expect(output).toContain("gh");
    expect(output).toContain("hn");
  });

  it("places untagged bookmarks in (unfiled)", async () => {
    const storePath = await makeStorePath(tmpDir, [
      { name: "plain", url: "https://example.com", tags: [] },
    ]);
    const program = makeProgram();
    await program.parseAsync(["node", "test", "folders", "--store", storePath]);
    const output = consoleSpy.mock.calls.map((c) => c[0]).join("\n");
    expect(output).toContain("(unfiled)");
  });

  it("filters to a specific folder with --folder", async () => {
    const storePath = await makeStorePath(tmpDir, [
      { name: "gh", url: "https://github.com", tags: ["folder:work"] },
      { name: "hn", url: "https://news.ycombinator.com", tags: ["folder:reading"] },
    ]);
    const program = makeProgram();
    await program.parseAsync(["node", "test", "folders", "--folder", "work", "--store", storePath]);
    const output = consoleSpy.mock.calls.map((c) => c[0]).join("\n");
    expect(output).toContain("gh");
    expect(output).not.toContain("hn");
  });

  it("shows message when no bookmarks exist", async () => {
    const storePath = await makeStorePath(tmpDir, []);
    const program = makeProgram();
    await program.parseAsync(["node", "test", "folders", "--store", storePath]);
    const output = consoleSpy.mock.calls.map((c) => c[0]).join("\n");
    expect(output).toContain("No bookmarks found");
  });
});
