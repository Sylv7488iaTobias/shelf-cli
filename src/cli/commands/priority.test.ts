import { Command } from "commander";
import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";
import { registerPriorityCommand } from "./priority";
import { saveStore } from "../../store/bookmarkStore";

async function makeTempDir(): Promise<string> {
  return fs.mkdtemp(path.join(os.tmpdir(), "shelf-priority-"));
}

function makeProgram(storePath: string): Command {
  const program = new Command();
  program.exitOverride();
  registerPriorityCommand(program);
  return program;
}

async function makeStore(storePath: string) {
  const store = {
    bookmarks: [
      { name: "example", url: "https://example.com", tags: [], createdAt: new Date().toISOString() },
    ],
  };
  await saveStore(storePath, store);
  return store;
}

describe("priority command", () => {
  let tmpDir: string;
  let storePath: string;

  beforeEach(async () => {
    tmpDir = await makeTempDir();
    storePath = path.join(tmpDir, "bookmarks.json");
    await makeStore(storePath);
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true });
  });

  it("sets a valid priority on a bookmark", async () => {
    const program = makeProgram(storePath);
    await program.parseAsync(["priority", "example", "high", "--store", storePath], { from: "user" });
    const raw = await fs.readFile(storePath, "utf-8");
    const store = JSON.parse(raw);
    expect(store.bookmarks[0].priority).toBe("high");
  });

  it("updates priority from previous value", async () => {
    const program = makeProgram(storePath);
    await program.parseAsync(["priority", "example", "low", "--store", storePath], { from: "user" });
    await program.parseAsync(["priority", "example", "medium", "--store", storePath], { from: "user" });
    const raw = await fs.readFile(storePath, "utf-8");
    const store = JSON.parse(raw);
    expect(store.bookmarks[0].priority).toBe("medium");
  });

  it("exits with error on invalid priority level", async () => {
    const program = makeProgram(storePath);
    const mockExit = jest.spyOn(process, "exit").mockImplementation(() => { throw new Error("exit"); });
    await expect(
      program.parseAsync(["priority", "example", "urgent", "--store", storePath], { from: "user" })
    ).rejects.toThrow();
    mockExit.mockRestore();
  });

  it("clears priority with priority:clear", async () => {
    const program = makeProgram(storePath);
    await program.parseAsync(["priority", "example", "high", "--store", storePath], { from: "user" });
    await program.parseAsync(["priority:clear", "example", "--store", storePath], { from: "user" });
    const raw = await fs.readFile(storePath, "utf-8");
    const store = JSON.parse(raw);
    expect(store.bookmarks[0].priority).toBeUndefined();
  });

  it("exits with error if bookmark not found", async () => {
    const program = makeProgram(storePath);
    const mockExit = jest.spyOn(process, "exit").mockImplementation(() => { throw new Error("exit"); });
    await expect(
      program.parseAsync(["priority", "nonexistent", "high", "--store", storePath], { from: "user" })
    ).rejects.toThrow();
    mockExit.mockRestore();
  });
});
