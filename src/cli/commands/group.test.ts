import { Command } from "commander";
import { registerGroupCommand, getGroupMap } from "./group";
import { loadStore, saveStore } from "../../store/bookmarkStore";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";

function makeTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "shelf-group-test-"));
}

function makeProgram(storePath: string): Command {
  const program = new Command();
  program.exitOverride();
  registerGroupCommand(program);
  // Inject store path into subcommands
  program.commands.forEach((cmd) => {
    cmd.commands.forEach((sub) => sub.setOptionValue("store", storePath));
  });
  return program;
}

function makeStore(storePath: string) {
  const store = {
    bookmarks: [
      { id: "1", name: "Alpha", url: "https://alpha.com", tags: [], folder: "work", createdAt: new Date().toISOString() },
      { id: "2", name: "Beta", url: "https://beta.com", tags: [], folder: "work", createdAt: new Date().toISOString() },
      { id: "3", name: "Gamma", url: "https://gamma.com", tags: [], folder: "personal", createdAt: new Date().toISOString() },
      { id: "4", name: "Delta", url: "https://delta.com", tags: [], createdAt: new Date().toISOString() },
    ],
  };
  fs.writeFileSync(storePath, JSON.stringify(store, null, 2));
  return store;
}

describe("getGroupMap", () => {
  it("groups bookmarks by folder", () => {
    const bms: any[] = [
      { id: "1", folder: "work" },
      { id: "2", folder: "work" },
      { id: "3", folder: "personal" },
      { id: "4" },
    ];
    const map = getGroupMap(bms);
    expect(map["work"]).toHaveLength(2);
    expect(map["personal"]).toHaveLength(1);
    expect(map["(none)"]).toHaveLength(1);
  });

  it("returns empty map for no bookmarks", () => {
    expect(getGroupMap([])).toEqual({});
  });
});

describe("group list command", () => {
  it("prints folder names and counts", () => {
    const dir = makeTempDir();
    const storePath = path.join(dir, "bookmarks.json");
    makeStore(storePath);
    const spy = jest.spyOn(console, "log").mockImplementation(() => {});
    const program = new Command();
    program.exitOverride();
    registerGroupCommand(program);
    program.parse(["node", "test", "group", "list", "--store", storePath]);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining("work"));
    expect(spy).toHaveBeenCalledWith(expect.stringContaining("personal"));
    spy.mockRestore();
  });
});

describe("group move command", () => {
  it("renames a folder across all bookmarks", () => {
    const dir = makeTempDir();
    const storePath = path.join(dir, "bookmarks.json");
    makeStore(storePath);
    const spy = jest.spyOn(console, "log").mockImplementation(() => {});
    const program = new Command();
    program.exitOverride();
    registerGroupCommand(program);
    program.parse(["node", "test", "group", "move", "work", "office", "--store", storePath]);
    const updated = JSON.parse(fs.readFileSync(storePath, "utf-8"));
    const officeBms = updated.bookmarks.filter((b: any) => b.folder === "office");
    expect(officeBms).toHaveLength(2);
    spy.mockRestore();
  });
});
