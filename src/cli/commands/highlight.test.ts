import { Command } from "commander";
import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";
import { registerHighlightCommand } from "./highlight";
import { saveStore } from "../../store/bookmarkStore";

async function makeTempDir(): Promise<string> {
  return fs.mkdtemp(path.join(os.tmpdir(), "shelf-highlight-"));
}

function makeProgram(): Command {
  const program = new Command();
  program.exitOverride();
  registerHighlightCommand(program);
  return program;
}

describe("highlight command", () => {
  let tmpDir: string;
  let storePath: string;

  beforeEach(async () => {
    tmpDir = await makeTempDir();
    storePath = path.join(tmpDir, "bookmarks.json");
    await saveStore(
      {
        bookmarks: [
          { name: "github", url: "https://github.com", tags: ["dev"] },
          { name: "news", url: "https://news.ycombinator.com", tags: [] },
        ],
      },
      storePath
    );
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true });
  });

  it("highlights a bookmark", async () => {
    const program = makeProgram();
    const spy = jest.spyOn(console, "log").mockImplementation(() => {});
    await program.parseAsync(["highlight", "github", "--store", storePath], { from: "user" });
    expect(spy).toHaveBeenCalledWith(expect.stringContaining("highlighted"));
    spy.mockRestore();
  });

  it("removes a highlight with --off", async () => {
    const program = makeProgram();
    await program.parseAsync(["highlight", "github", "--store", storePath], { from: "user" });
    const spy = jest.spyOn(console, "log").mockImplementation(() => {});
    await program.parseAsync(["highlight", "github", "--off", "--store", storePath], { from: "user" });
    expect(spy).toHaveBeenCalledWith(expect.stringContaining("removed"));
    spy.mockRestore();
  });

  it("exits with error for unknown bookmark", async () => {
    const program = makeProgram();
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    const exitSpy = jest.spyOn(process, "exit").mockImplementation(() => { throw new Error("exit"); });
    await expect(
      program.parseAsync(["highlight", "unknown", "--store", storePath], { from: "user" })
    ).rejects.toThrow("exit");
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('"unknown" not found'));
    spy.mockRestore();
    exitSpy.mockRestore();
  });

  it("lists highlighted bookmarks", async () => {
    const program = makeProgram();
    await program.parseAsync(["highlight", "github", "--store", storePath], { from: "user" });
    const spy = jest.spyOn(console, "log").mockImplementation(() => {});
    await program.parseAsync(["highlights", "--store", storePath], { from: "user" });
    const output = spy.mock.calls.map((c) => c[0]).join("\n");
    expect(output).toContain("github");
    expect(output).toContain("★");
    spy.mockRestore();
  });

  it("shows empty message when no highlights exist", async () => {
    const program = makeProgram();
    const spy = jest.spyOn(console, "log").mockImplementation(() => {});
    await program.parseAsync(["highlights", "--store", storePath], { from: "user" });
    expect(spy).toHaveBeenCalledWith("No highlighted bookmarks.");
    spy.mockRestore();
  });
});
