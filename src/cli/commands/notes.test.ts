import { Command } from "commander";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { registerNotesCommand } from "./notes";
import { saveStore } from "../../store/bookmarkStore";

function makeTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "shelf-notes-test-"));
}

function makeProgram(storePath: string): Command {
  process.env.SHELF_STORE_PATH = storePath;
  const program = new Command();
  program.exitOverride();
  registerNotesCommand(program);
  return program;
}

const sampleStore = {
  bookmarks: [
    { name: "gh", url: "https://github.com", tags: [], pinned: false },
  ],
};

describe("notes command", () => {
  let tmpDir: string;
  let storePath: string;

  beforeEach(() => {
    tmpDir = makeTempDir();
    storePath = path.join(tmpDir, "bookmarks.json");
    saveStore(storePath, JSON.parse(JSON.stringify(sampleStore)));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true });
    delete process.env.SHELF_STORE_PATH;
  });

  it("sets a note on a bookmark", async () => {
    const program = makeProgram(storePath);
    const spy = jest.spyOn(console, "log").mockImplementation(() => {});
    await program.parseAsync(["node", "test", "notes", "gh", "--set", "My fav site"]);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining("Notes updated"));
    const store = JSON.parse(fs.readFileSync(storePath, "utf-8"));
    expect(store.bookmarks[0].notes).toBe("My fav site");
    spy.mockRestore();
  });

  it("views an existing note", async () => {
    const store = JSON.parse(fs.readFileSync(storePath, "utf-8"));
    store.bookmarks[0].notes = "Hello world";
    fs.writeFileSync(storePath, JSON.stringify(store));
    const program = makeProgram(storePath);
    const spy = jest.spyOn(console, "log").mockImplementation(() => {});
    await program.parseAsync(["node", "test", "notes", "gh"]);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining("Hello world"));
    spy.mockRestore();
  });

  it("reports no notes when none set", async () => {
    const program = makeProgram(storePath);
    const spy = jest.spyOn(console, "log").mockImplementation(() => {});
    await program.parseAsync(["node", "test", "notes", "gh"]);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining("No notes"));
    spy.mockRestore();
  });

  it("clears a note", async () => {
    const store = JSON.parse(fs.readFileSync(storePath, "utf-8"));
    store.bookmarks[0].notes = "to be removed";
    fs.writeFileSync(storePath, JSON.stringify(store));
    const program = makeProgram(storePath);
    const spy = jest.spyOn(console, "log").mockImplementation(() => {});
    await program.parseAsync(["node", "test", "notes", "gh", "--clear"]);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining("cleared"));
    const updated = JSON.parse(fs.readFileSync(storePath, "utf-8"));
    expect(updated.bookmarks[0].notes).toBeUndefined();
    spy.mockRestore();
  });

  it("exits with error for unknown bookmark", async () => {
    const program = makeProgram(storePath);
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    const exitSpy = jest.spyOn(process, "exit").mockImplementation(() => { throw new Error("exit"); });
    await expect(
      program.parseAsync(["node", "test", "notes", "unknown"])
    ).rejects.toThrow();
    expect(spy).toHaveBeenCalledWith(expect.stringContaining("not found"));
    spy.mockRestore();
    exitSpy.mockRestore();
  });
});
