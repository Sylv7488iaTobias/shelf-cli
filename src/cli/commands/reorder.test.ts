import { describe, it, expect, vi, beforeEach } from "vitest";
import { Command } from "commander";
import { reorderBookmarks, registerReorderCommand } from "./reorder";

function makeBookmark(id: string, url: string) {
  return { id, url, title: id, tags: [], folder: "", createdAt: Date.now() };
}

function makeProgram(storePath: string) {
  const program = new Command();
  program.exitOverride();
  registerReorderCommand(program);
  return program;
}

vi.mock("../../store/bookmarkStore", () => {
  const store = {
    bookmarks: [
      { id: "a", url: "https://a.com" },
      { id: "b", url: "https://b.com" },
      { id: "c", url: "https://c.com" },
    ],
  };
  return {
    loadStore: vi.fn().mockResolvedValue(store),
    saveStore: vi.fn().mockResolvedValue(undefined),
  };
});

describe("reorderBookmarks", () => {
  it("moves specified ids to the front", () => {
    const bookmarks = [
      makeBookmark("a", "https://a.com"),
      makeBookmark("b", "https://b.com"),
      makeBookmark("c", "https://c.com"),
    ];
    const result = reorderBookmarks(bookmarks, ["c", "a"]);
    expect(result[0].id).toBe("c");
    expect(result[1].id).toBe("a");
    expect(result[2].id).toBe("b");
  });

  it("ignores ids not present in bookmarks", () => {
    const bookmarks = [
      makeBookmark("a", "https://a.com"),
      makeBookmark("b", "https://b.com"),
    ];
    const result = reorderBookmarks(bookmarks, ["z", "a"]);
    expect(result[0].id).toBe("a");
    expect(result[1].id).toBe("b");
  });

  it("returns all bookmarks unchanged if ids is empty", () => {
    const bookmarks = [
      makeBookmark("a", "https://a.com"),
      makeBookmark("b", "https://b.com"),
    ];
    const result = reorderBookmarks(bookmarks, []);
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe("a");
  });
});

describe("registerReorderCommand", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("registers the reorder command", () => {
    const program = makeProgram("/tmp/store.json");
    const cmd = program.commands.find((c) => c.name() === "reorder");
    expect(cmd).toBeDefined();
  });

  it("calls loadStore and saveStore on valid ids", async () => {
    const { loadStore, saveStore } = await import("../../store/bookmarkStore");
    const program = makeProgram("/tmp/store.json");
    await program.parseAsync(["node", "test", "reorder", "a", "b"]);
    expect(loadStore).toHaveBeenCalled();
    expect(saveStore).toHaveBeenCalled();
  });
});
