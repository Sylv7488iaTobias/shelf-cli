import { Command } from "commander";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { mergeStores, registerMergeCommand } from "./merge";
import { Bookmark } from "../../store/bookmarkStore";

function makeBookmark(overrides: Partial<Bookmark> = {}): Bookmark {
  return {
    id: Math.random().toString(36).slice(2),
    url: `https://example.com/${Math.random()}`,
    title: "Example",
    tags: [],
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

function makeProgram() {
  const program = new Command();
  program.exitOverride();
  registerMergeCommand(program);
  return program;
}

describe("mergeStores", () => {
  it("adds non-duplicate bookmarks", () => {
    const base = [makeBookmark({ id: "a", url: "https://a.com" })];
    const incoming = [makeBookmark({ id: "b", url: "https://b.com" })];
    const { merged, added, skipped } = mergeStores(base, incoming);
    expect(merged).toHaveLength(2);
    expect(added).toBe(1);
    expect(skipped).toBe(0);
  });

  it("skips bookmarks with duplicate URL", () => {
    const base = [makeBookmark({ id: "a", url: "https://dup.com" })];
    const incoming = [makeBookmark({ id: "b", url: "https://dup.com" })];
    const { merged, added, skipped } = mergeStores(base, incoming);
    expect(merged).toHaveLength(1);
    expect(added).toBe(0);
    expect(skipped).toBe(1);
  });

  it("skips bookmarks with duplicate ID", () => {
    const base = [makeBookmark({ id: "same", url: "https://a.com" })];
    const incoming = [makeBookmark({ id: "same", url: "https://b.com" })];
    const { merged, added, skipped } = mergeStores(base, incoming);
    expect(merged).toHaveLength(1);
    expect(added).toBe(0);
    expect(skipped).toBe(1);
  });

  it("handles empty incoming list", () => {
    const base = [makeBookmark()];
    const { merged, added, skipped } = mergeStores(base, []);
    expect(merged).toHaveLength(1);
    expect(added).toBe(0);
    expect(skipped).toBe(0);
  });
});

describe("merge command", () => {
  it("errors on missing file", () => {
    const program = makeProgram();
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    const exitSpy = jest.spyOn(process, "exit").mockImplementation(() => { throw new Error("exit"); });
    expect(() => program.parse(["node", "shelf", "merge", "/nonexistent/file.json"])).toThrow();
    expect(spy).toHaveBeenCalledWith(expect.stringContaining("File not found"));
    spy.mockRestore();
    exitSpy.mockRestore();
  });

  it("errors on invalid JSON file", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "shelf-merge-"));
    const badFile = path.join(tmp, "bad.json");
    fs.writeFileSync(badFile, "not json");
    const program = makeProgram();
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    const exitSpy = jest.spyOn(process, "exit").mockImplementation(() => { throw new Error("exit"); });
    expect(() => program.parse(["node", "shelf", "merge", badFile])).toThrow();
    expect(spy).toHaveBeenCalledWith(expect.stringContaining("Failed to parse"));
    spy.mockRestore();
    exitSpy.mockRestore();
    fs.rmSync(tmp, { recursive: true });
  });
});
