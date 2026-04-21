import { Command } from "commander";
import * as fs from "fs/promises";
import * as os from "os";
import * as path from "path";
import { registerDueCommand, isDueDate, formatDueBookmark } from "./due";

async function makeTempDir(): Promise<string> {
  return fs.mkdtemp(path.join(os.tmpdir(), "shelf-due-"));
}

function makeProgram(storePath: string): Command {
  const program = new Command();
  program.exitOverride();
  registerDueCommand(program);
  return program;
}

async function makeStore(dir: string, bookmarks: object[] = []) {
  const storePath = path.join(dir, "bookmarks.json");
  await fs.writeFile(storePath, JSON.stringify({ bookmarks }));
  return storePath;
}

describe("isDueDate", () => {
  it("returns true for valid dates", () => {
    expect(isDueDate("2025-12-31")).toBe(true);
    expect(isDueDate("2024-01-01")).toBe(true);
  });

  it("returns false for invalid dates", () => {
    expect(isDueDate("not-a-date")).toBe(false);
    expect(isDueDate("")).toBe(false);
  });
});

describe("formatDueBookmark", () => {
  it("formats a bookmark with due date", () => {
    const b = { id: "1", title: "Example", url: "https://example.com", tags: [], due: "2099-12-31T00:00:00.000Z" } as any;
    const result = formatDueBookmark(b);
    expect(result).toContain("Example");
    expect(result).toContain("https://example.com");
    expect(result).not.toContain("OVERDUE");
  });

  it("marks overdue bookmarks", () => {
    const b = { id: "1", title: "Old", url: "https://old.com", tags: [], due: "2000-01-01T00:00:00.000Z" } as any;
    expect(formatDueBookmark(b)).toContain("OVERDUE");
  });
});

describe("due set", () => {
  it("sets a due date on a bookmark", async () => {
    const dir = await makeTempDir();
    const storePath = await makeStore(dir, [{ id: "abc", title: "Test", url: "https://test.com", tags: [] }]);
    const program = makeProgram(storePath);
    await program.parseAsync(["node", "test", "due", "set", "abc", "2099-06-01", "--store", storePath]);
    const raw = JSON.parse(await fs.readFile(storePath, "utf-8"));
    expect(raw.bookmarks[0].due).toContain("2099-06-01");
  });

  it("errors on invalid date", async () => {
    const dir = await makeTempDir();
    const storePath = await makeStore(dir, [{ id: "abc", title: "Test", url: "https://test.com", tags: [] }]);
    const program = makeProgram(storePath);
    const mockExit = jest.spyOn(process, "exit").mockImplementation(() => { throw new Error("exit"); });
    await expect(program.parseAsync(["node", "test", "due", "set", "abc", "bad-date", "--store", storePath])).rejects.toThrow();
    mockExit.mockRestore();
  });
});

describe("due clear", () => {
  it("clears a due date from a bookmark", async () => {
    const dir = await makeTempDir();
    const storePath = await makeStore(dir, [{ id: "abc", title: "Test", url: "https://test.com", tags: [], due: "2099-01-01T00:00:00.000Z" }]);
    const program = makeProgram(storePath);
    await program.parseAsync(["node", "test", "due", "clear", "abc", "--store", storePath]);
    const raw = JSON.parse(await fs.readFile(storePath, "utf-8"));
    expect(raw.bookmarks[0].due).toBeUndefined();
  });
});

describe("due list", () => {
  it("lists bookmarks with due dates", async () => {
    const dir = await makeTempDir();
    const storePath = await makeStore(dir, [
      { id: "1", title: "Future", url: "https://future.com", tags: [], due: "2099-01-01T00:00:00.000Z" },
      { id: "2", title: "NoDue", url: "https://nodule.com", tags: [] },
    ]);
    const program = makeProgram(storePath);
    const spy = jest.spyOn(console, "log").mockImplementation(() => {});
    await program.parseAsync(["node", "test", "due", "list", "--store", storePath]);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining("Future"));
    spy.mockRestore();
  });
});
