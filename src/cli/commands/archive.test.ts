import { Command } from "commander";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { registerArchiveCommand } from "./archive";
import { saveStore } from "../../store/bookmarkStore";

function makeTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "shelf-archive-test-"));
}

function makeStorePath(dir: string): string {
  return path.join(dir, "bookmarks.json");
}

function makeProgram(storePath: string): Command {
  process.env.SHELF_STORE_PATH = storePath;
  const program = new Command();
  program.exitOverride();
  registerArchiveCommand(program);
  return program;
}

describe("archive command", () => {
  let tmpDir: string;
  let storePath: string;

  beforeEach(() => {
    tmpDir = makeTempDir();
    storePath = makeStorePath(tmpDir);
    saveStore(storePath, {
      bookmarks: [
        { name: "gh", url: "https://github.com", tags: [], pinned: false, archived: false },
        { name: "old-site", url: "https://old.example.com", tags: [], pinned: false, archived: true },
      ],
    });
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true });
    delete process.env.SHELF_STORE_PATH;
  });

  it("archives an existing bookmark", async () => {
    const program = makeProgram(storePath);
    const spy = jest.spyOn(console, "log").mockImplementation(() => {});
    await program.parseAsync(["node", "test", "archive", "gh"]);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining("archived"));
    spy.mockRestore();
  });

  it("unarchives an archived bookmark", async () => {
    const program = makeProgram(storePath);
    const spy = jest.spyOn(console, "log").mockImplementation(() => {});
    await program.parseAsync(["node", "test", "archive", "old-site", "--unarchive"]);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining("unarchived"));
    spy.mockRestore();
  });

  it("lists archived bookmarks", async () => {
    const program = makeProgram(storePath);
    const spy = jest.spyOn(console, "log").mockImplementation(() => {});
    await program.parseAsync(["node", "test", "archive", "_", "--list"]);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining("old-site"));
    spy.mockRestore();
  });

  it("errors when bookmark not found", async () => {
    const program = makeProgram(storePath);
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    const exitSpy = jest.spyOn(process, "exit").mockImplementation(() => { throw new Error("exit"); });
    await expect(program.parseAsync(["node", "test", "archive", "nonexistent"])).rejects.toThrow();
    expect(spy).toHaveBeenCalledWith(expect.stringContaining("not found"));
    spy.mockRestore();
    exitSpy.mockRestore();
  });
});
