import { Command } from "commander";
import { registerRecentCommand } from "./recent";
import * as bookmarkStore from "../../store/bookmarkStore";

function makeProgram(): Command {
  const program = new Command();
  program.exitOverride();
  registerRecentCommand(program);
  return program;
}

function makeBookmark(name: string, url: string, daysAgo: number, folder?: string) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return {
    id: name,
    name,
    url,
    tags: [],
    folder,
    createdAt: date.toISOString(),
    pinned: false,
  };
}

describe("recent command", () => {
  let consoleSpy: jest.SpyInstance;
  let loadStoreSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    loadStoreSpy = jest.spyOn(bookmarkStore, "loadStore");
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("shows bookmarks sorted by most recent first", async () => {
    loadStoreSpy.mockReturnValue({
      bookmarks: [
        makeBookmark("Older", "https://older.com", 5),
        makeBookmark("Newest", "https://newest.com", 0),
        makeBookmark("Middle", "https://middle.com", 2),
      ],
    });
    const program = makeProgram();
    await program.parseAsync(["node", "test", "recent"]);
    const output = consoleSpy.mock.calls.map((c) => c[0]).join("\n");
    const newestIdx = output.indexOf("Newest");
    const olderIdx = output.indexOf("Older");
    expect(newestIdx).toBeLessThan(olderIdx);
  });

  it("limits results to --count", async () => {
    loadStoreSpy.mockReturnValue({
      bookmarks: [
        makeBookmark("A", "https://a.com", 1),
        makeBookmark("B", "https://b.com", 2),
        makeBookmark("C", "https://c.com", 3),
      ],
    });
    const program = makeProgram();
    await program.parseAsync(["node", "test", "recent", "-n", "2"]);
    const output = consoleSpy.mock.calls.map((c) => c[0]).join("\n");
    expect(output).toContain("A");
    expect(output).toContain("B");
    expect(output).not.toContain("C");
  });

  it("filters by folder", async () => {
    loadStoreSpy.mockReturnValue({
      bookmarks: [
        makeBookmark("InFolder", "https://infolder.com", 1, "work"),
        makeBookmark("NotInFolder", "https://notinfolder.com", 0),
      ],
    });
    const program = makeProgram();
    await program.parseAsync(["node", "test", "recent", "--folder", "work"]);
    const output = consoleSpy.mock.calls.map((c) => c[0]).join("\n");
    expect(output).toContain("InFolder");
    expect(output).not.toContain("NotInFolder");
  });

  it("shows message when no bookmarks found", async () => {
    loadStoreSpy.mockReturnValue({ bookmarks: [] });
    const program = makeProgram();
    await program.parseAsync(["node", "test", "recent"]);
    expect(consoleSpy).toHaveBeenCalledWith("No bookmarks found.");
  });
});
