import { Command } from "commander";
import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";
import { registerTagCommand } from "./tag";
import * as bookmarkStore from "../../store/bookmarkStore";

function makeProgram(): Command {
  const program = new Command();
  program.exitOverride();
  registerTagCommand(program);
  return program;
}

describe("tag command", () => {
  let storeSpy: jest.SpyInstance;
  let saveSpy: jest.SpyInstance;

  const mockStore = () => ({
    bookmarks: [
      { id: "abc123", title: "Example", url: "https://example.com", tags: ["web"], createdAt: new Date().toISOString() },
      { id: "def456", title: "GitHub", url: "https://github.com", tags: [], createdAt: new Date().toISOString() },
    ],
  });

  beforeEach(() => {
    storeSpy = jest.spyOn(bookmarkStore, "loadStore").mockResolvedValue(mockStore() as any);
    saveSpy = jest.spyOn(bookmarkStore, "saveStore").mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("lists existing tags when no tags provided", async () => {
    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    const program = makeProgram();
    await program.parseAsync(["node", "test", "tag", "abc123"]);
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("web"));
    expect(saveSpy).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it("adds new tags to a bookmark", async () => {
    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    const program = makeProgram();
    await program.parseAsync(["node", "test", "tag", "abc123", "typescript", "tools"]);
    expect(saveSpy).toHaveBeenCalledTimes(1);
    const saved = saveSpy.mock.calls[0][0];
    const updated = saved.bookmarks.find((b: any) => b.id === "abc123");
    expect(updated.tags).toContain("typescript");
    expect(updated.tags).toContain("tools");
    expect(updated.tags).toContain("web");
    consoleSpy.mockRestore();
  });

  it("removes tags with --remove flag", async () => {
    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    const program = makeProgram();
    await program.parseAsync(["node", "test", "tag", "--remove", "abc123", "web"]);
    expect(saveSpy).toHaveBeenCalledTimes(1);
    const saved = saveSpy.mock.calls[0][0];
    const updated = saved.bookmarks.find((b: any) => b.id === "abc123");
    expect(updated.tags).not.toContain("web");
    consoleSpy.mockRestore();
  });

  it("exits with error when bookmark not found", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    const exitSpy = jest.spyOn(process, "exit").mockImplementation((() => {}) as any);
    const program = makeProgram();
    await program.parseAsync(["node", "test", "tag", "nonexistent", "foo"]);
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("No bookmark found"), expect.any(String));
    expect(exitSpy).toHaveBeenCalledWith(1);
    consoleSpy.mockRestore();
    exitSpy.mockRestore();
  });
});
