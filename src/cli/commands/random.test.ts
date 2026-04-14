import { Command } from "commander";
import { registerRandomCommand } from "./random";
import * as bookmarkStore from "../../store/bookmarkStore";

function makeProgram(): Command {
  const program = new Command();
  program.exitOverride();
  registerRandomCommand(program);
  return program;
}

function makeBookmark(overrides: Partial<bookmarkStore.Bookmark> = {}): bookmarkStore.Bookmark {
  return {
    id: "abc123",
    name: "Example",
    url: "https://example.com",
    tags: [],
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

describe("random command", () => {
  let consoleSpy: jest.SpyInstance;
  let loadStoreSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    loadStoreSpy = jest.spyOn(bookmarkStore, "loadStore");
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("prints a random bookmark from the store", async () => {
    const bm = makeBookmark({ name: "TestSite", url: "https://test.com" });
    loadStoreSpy.mockReturnValue({ bookmarks: [bm] });
    const program = makeProgram();
    await program.parseAsync(["node", "test", "random"]);
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("TestSite"));
  });

  it("prints message when no bookmarks exist", async () => {
    loadStoreSpy.mockReturnValue({ bookmarks: [] });
    const program = makeProgram();
    await program.parseAsync(["node", "test", "random"]);
    expect(consoleSpy).toHaveBeenCalledWith("No bookmarks found matching the given filters.");
  });

  it("filters by tag", async () => {
    const bm1 = makeBookmark({ id: "1", name: "Tagged", tags: ["dev"] });
    const bm2 = makeBookmark({ id: "2", name: "Untagged", tags: [] });
    loadStoreSpy.mockReturnValue({ bookmarks: [bm1, bm2] });
    const program = makeProgram();
    await program.parseAsync(["node", "test", "random", "--tag", "dev"]);
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Tagged"));
  });

  it("filters by folder", async () => {
    const bm1 = makeBookmark({ id: "1", name: "InFolder", folder: "work" });
    const bm2 = makeBookmark({ id: "2", name: "NoFolder" });
    loadStoreSpy.mockReturnValue({ bookmarks: [bm1, bm2] });
    const program = makeProgram();
    await program.parseAsync(["node", "test", "random", "--folder", "work"]);
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("InFolder"));
  });

  it("excludes archived bookmarks by default", async () => {
    const bm = makeBookmark({ id: "1", name: "Archived", archived: true });
    loadStoreSpy.mockReturnValue({ bookmarks: [bm] });
    const program = makeProgram();
    await program.parseAsync(["node", "test", "random"]);
    expect(consoleSpy).toHaveBeenCalledWith("No bookmarks found matching the given filters.");
  });

  it("includes archived bookmarks when --archived flag is set", async () => {
    const bm = makeBookmark({ id: "1", name: "Archived", archived: true });
    loadStoreSpy.mockReturnValue({ bookmarks: [bm] });
    const program = makeProgram();
    await program.parseAsync(["node", "test", "random", "--archived"]);
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Archived"));
  });
});
