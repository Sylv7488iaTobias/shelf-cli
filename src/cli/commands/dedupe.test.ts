import { Command } from "commander";
import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";
import { findDuplicates, registerDedupeCommand } from "./dedupe";
import { Bookmark } from "../../store/bookmarkStore";

function makeBookmark(name: string, url: string): Bookmark {
  return { id: name, name, url, tags: [], createdAt: new Date().toISOString() };
}

async function makeTempStore(bookmarks: Bookmark[]): Promise<string> {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "shelf-dedupe-"));
  const storePath = path.join(dir, "bookmarks.json");
  await fs.writeFile(storePath, JSON.stringify({ bookmarks }), "utf-8");
  return storePath;
}

function makeProgram(storePath: string): Command {
  const program = new Command();
  program.exitOverride();
  registerDedupeCommand(program);
  return program;
}

describe("findDuplicates", () => {
  it("returns no duplicates for unique URLs", () => {
    const bookmarks = [
      makeBookmark("a", "https://example.com"),
      makeBookmark("b", "https://other.com"),
    ];
    const { removed, kept } = findDuplicates(bookmarks);
    expect(removed).toHaveLength(0);
    expect(kept).toHaveLength(2);
  });

  it("detects exact duplicate URLs", () => {
    const bookmarks = [
      makeBookmark("a", "https://example.com"),
      makeBookmark("b", "https://example.com"),
    ];
    const { removed, kept } = findDuplicates(bookmarks);
    expect(removed).toHaveLength(1);
    expect(removed[0].name).toBe("b");
    expect(kept).toHaveLength(1);
  });

  it("normalizes trailing slashes", () => {
    const bookmarks = [
      makeBookmark("a", "https://example.com"),
      makeBookmark("b", "https://example.com/"),
    ];
    const { removed } = findDuplicates(bookmarks);
    expect(removed).toHaveLength(1);
  });

  it("is case-insensitive for URLs", () => {
    const bookmarks = [
      makeBookmark("a", "https://Example.COM"),
      makeBookmark("b", "https://example.com"),
    ];
    const { removed } = findDuplicates(bookmarks);
    expect(removed).toHaveLength(1);
  });
});

describe("dedupe command", () => {
  it("reports no duplicates when all URLs are unique", async () => {
    const storePath = await makeTempStore([
      makeBookmark("a", "https://one.com"),
      makeBookmark("b", "https://two.com"),
    ]);
    const program = makeProgram(storePath);
    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    await program.parseAsync(["node", "test", "dedupe", "--store", storePath]);
    expect(consoleSpy).toHaveBeenCalledWith("No duplicate bookmarks found.");
    consoleSpy.mockRestore();
  });

  it("removes duplicates and saves the store", async () => {
    const storePath = await makeTempStore([
      makeBookmark("a", "https://dup.com"),
      makeBookmark("b", "https://dup.com"),
    ]);
    const program = makeProgram(storePath);
    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    await program.parseAsync(["node", "test", "dedupe", "--store", storePath]);
    const raw = JSON.parse(await fs.readFile(storePath, "utf-8"));
    expect(raw.bookmarks).toHaveLength(1);
    consoleSpy.mockRestore();
  });

  it("does not save when --dry-run is passed", async () => {
    const storePath = await makeTempStore([
      makeBookmark("a", "https://dup.com"),
      makeBookmark("b", "https://dup.com"),
    ]);
    const program = makeProgram(storePath);
    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    await program.parseAsync(["node", "test", "dedupe", "--dry-run", "--store", storePath]);
    const raw = JSON.parse(await fs.readFile(storePath, "utf-8"));
    expect(raw.bookmarks).toHaveLength(2);
    consoleSpy.mockRestore();
  });
});
