import { Command } from "commander";
import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";
import { registerUnarchiveCommand } from "./unarchive";
import { saveStore } from "../../store/bookmarkStore";

async function makeTempDir(): Promise<string> {
  return fs.mkdtemp(path.join(os.tmpdir(), "shelf-unarchive-"));
}

async function makeStorePath(dir: string) {
  return path.join(dir, "bookmarks.json");
}

function makeProgram(storePath: string): Command {
  const program = new Command();
  program.exitOverride();
  registerUnarchiveCommand(program);
  return program;
}

describe("unarchive command", () => {
  it("restores an archived bookmark", async () => {
    const dir = await makeTempDir();
    const storePath = await makeStorePath(dir);
    await saveStore(storePath, {
      bookmarks: [
        { name: "gh", url: "https://github.com", tags: [], archived: true, createdAt: new Date().toISOString() },
      ],
    });

    const program = makeProgram(storePath);
    const spy = jest.spyOn(console, "log").mockImplementation(() => {});

    await program.parseAsync(["node", "test", "unarchive", "gh", "--store", storePath]);

    const raw = JSON.parse(await fs.readFile(storePath, "utf-8"));
    expect(raw.bookmarks[0].archived).toBe(false);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining("restored from archive"));
    spy.mockRestore();
  });

  it("prints message if bookmark is not archived", async () => {
    const dir = await makeTempDir();
    const storePath = await makeStorePath(dir);
    await saveStore(storePath, {
      bookmarks: [
        { name: "gh", url: "https://github.com", tags: [], archived: false, createdAt: new Date().toISOString() },
      ],
    });

    const program = makeProgram(storePath);
    const spy = jest.spyOn(console, "log").mockImplementation(() => {});

    await program.parseAsync(["node", "test", "unarchive", "gh", "--store", storePath]);

    expect(spy).toHaveBeenCalledWith(expect.stringContaining("not archived"));
    spy.mockRestore();
  });

  it("exits with error if bookmark not found", async () => {
    const dir = await makeTempDir();
    const storePath = await makeStorePath(dir);
    await saveStore(storePath, { bookmarks: [] });

    const program = makeProgram(storePath);
    const errSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    const exitSpy = jest.spyOn(process, "exit").mockImplementation(() => { throw new Error("exit"); });

    await expect(
      program.parseAsync(["node", "test", "unarchive", "missing", "--store", storePath])
    ).rejects.toThrow("exit");

    expect(errSpy).toHaveBeenCalledWith(expect.stringContaining("No bookmark found"));
    errSpy.mockRestore();
    exitSpy.mockRestore();
  });
});
