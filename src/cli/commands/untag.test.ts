import { Command } from "commander";
import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";
import { registerUntagCommand } from "./untag";
import { saveStore } from "../../store/bookmarkStore";

async function makeTempDir(): Promise<string> {
  return fs.mkdtemp(path.join(os.tmpdir(), "shelf-untag-"));
}

function makeProgram(storePath: string): Command {
  const program = new Command();
  program.exitOverride();
  registerUntagCommand(program);
  return program;
}

describe("untag command", () => {
  let tmpDir: string;
  let storePath: string;

  beforeEach(async () => {
    tmpDir = await makeTempDir();
    storePath = path.join(tmpDir, "bookmarks.json");
    await saveStore(storePath, {
      bookmarks: [
        {
          name: "example",
          url: "https://example.com",
          tags: ["web", "tools", "dev"],
          createdAt: new Date().toISOString(),
        },
      ],
    });
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it("removes a single tag from a bookmark", async () => {
    const program = makeProgram(storePath);
    await program.parseAsync(["untag", "example", "web", "--store", storePath], { from: "user" });
    const raw = await fs.readFile(storePath, "utf-8");
    const store = JSON.parse(raw);
    expect(store.bookmarks[0].tags).toEqual(["tools", "dev"]);
  });

  it("removes multiple tags from a bookmark", async () => {
    const program = makeProgram(storePath);
    await program.parseAsync(["untag", "example", "web", "dev", "--store", storePath], { from: "user" });
    const raw = await fs.readFile(storePath, "utf-8");
    const store = JSON.parse(raw);
    expect(store.bookmarks[0].tags).toEqual(["tools"]);
  });

  it("does not fail when tag does not exist on bookmark", async () => {
    const program = makeProgram(storePath);
    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    await program.parseAsync(["untag", "example", "nonexistent", "--store", storePath], { from: "user" });
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("No matching tags found"));
    consoleSpy.mockRestore();
  });

  it("exits with error when bookmark not found", async () => {
    const program = makeProgram(storePath);
    const exitSpy = jest.spyOn(process, "exit").mockImplementation(() => { throw new Error("exit"); });
    await expect(
      program.parseAsync(["untag", "missing", "web", "--store", storePath], { from: "user" })
    ).rejects.toThrow("exit");
    expect(exitSpy).toHaveBeenCalledWith(1);
    exitSpy.mockRestore();
  });
});
