import { Command } from "commander";
import { registerCountCommand } from "./count";
import * as bookmarkStore from "../../store/bookmarkStore";

function makeProgram(): Command {
  const program = new Command();
  program.exitOverride();
  registerCountCommand(program);
  return program;
}

const baseStore = {
  bookmarks: [
    { id: "1", name: "Alpha", url: "https://alpha.com", tags: ["dev"], folder: "work", pinned: true, archived: false, createdAt: "2024-01-01" },
    { id: "2", name: "Beta", url: "https://beta.com", tags: ["news"], folder: "personal", pinned: false, archived: false, createdAt: "2024-01-02" },
    { id: "3", name: "Gamma", url: "https://gamma.com", tags: ["dev"], folder: "work", pinned: false, archived: true, createdAt: "2024-01-03" },
    { id: "4", name: "Delta", url: "https://delta.com", tags: [], folder: "work", pinned: true, archived: false, createdAt: "2024-01-04" },
  ],
};

describe("count command", () => {
  let loadStoreSpy: jest.SpyInstance;
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    loadStoreSpy = jest.spyOn(bookmarkStore, "loadStore").mockReturnValue(baseStore as any);
    consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("counts all bookmarks with no filters", () => {
    makeProgram().parse(["count"], { from: "user" });
    expect(consoleSpy).toHaveBeenCalledWith("4 bookmarks");
  });

  it("counts bookmarks by folder", () => {
    makeProgram().parse(["count", "--folder", "work"], { from: "user" });
    expect(consoleSpy).toHaveBeenCalledWith('3 bookmarks (folder "work")');
  });

  it("counts bookmarks by tag", () => {
    makeProgram().parse(["count", "--tag", "dev"], { from: "user" });
    expect(consoleSpy).toHaveBeenCalledWith('2 bookmarks (tag "dev")');
  });

  it("counts archived bookmarks", () => {
    makeProgram().parse(["count", "--archived"], { from: "user" });
    expect(consoleSpy).toHaveBeenCalledWith("1 bookmark (archived)");
  });

  it("counts pinned bookmarks", () => {
    makeProgram().parse(["count", "--pinned"], { from: "user" });
    expect(consoleSpy).toHaveBeenCalledWith("2 bookmarks (pinned)");
  });

  it("combines folder and tag filters", () => {
    makeProgram().parse(["count", "--folder", "work", "--tag", "dev"], { from: "user" });
    expect(consoleSpy).toHaveBeenCalledWith('1 bookmark (folder "work", tag "dev")');
  });

  it("returns 0 when no bookmarks match", () => {
    makeProgram().parse(["count", "--folder", "nonexistent"], { from: "user" });
    expect(consoleSpy).toHaveBeenCalledWith('0 bookmarks (folder "nonexistent")');
  });
});
