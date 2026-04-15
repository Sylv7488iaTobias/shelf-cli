import { Command } from "commander";
import { registerGroupCommand } from "./group";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";

function makeTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "shelf-group-int-"));
}

function seedStore(storePath: string) {
  const store = {
    bookmarks: [
      { id: "a1", name: "GH", url: "https://github.com", tags: ["dev"], folder: "dev", createdAt: new Date().toISOString() },
      { id: "a2", name: "SO", url: "https://stackoverflow.com", tags: [], folder: "dev", createdAt: new Date().toISOString() },
      { id: "a3", name: "NYT", url: "https://nytimes.com", tags: ["news"], folder: "reading", createdAt: new Date().toISOString() },
    ],
  };
  fs.writeFileSync(storePath, JSON.stringify(store, null, 2));
}

describe("group integration", () => {
  let dir: string;
  let storePath: string;

  beforeEach(() => {
    dir = makeTempDir();
    storePath = path.join(dir, "bookmarks.json");
    seedStore(storePath);
  });

  it("list → move → list reflects rename", () => {
    const logs: string[] = [];
    const spy = jest.spyOn(console, "log").mockImplementation((msg) => logs.push(msg));

    const p1 = new Command();
    p1.exitOverride();
    registerGroupCommand(p1);
    p1.parse(["node", "test", "group", "list", "--store", storePath]);

    expect(logs.some((l) => l.includes("dev"))).toBe(true);
    expect(logs.some((l) => l.includes("reading"))).toBe(true);

    logs.length = 0;

    const p2 = new Command();
    p2.exitOverride();
    registerGroupCommand(p2);
    p2.parse(["node", "test", "group", "move", "dev", "engineering", "--store", storePath]);

    logs.length = 0;

    const p3 = new Command();
    p3.exitOverride();
    registerGroupCommand(p3);
    p3.parse(["node", "test", "group", "list", "--store", storePath]);

    expect(logs.some((l) => l.includes("engineering"))).toBe(true);
    expect(logs.some((l) => l.includes("dev (2)"))).toBe(false);

    spy.mockRestore();
  });

  it("show returns correct bookmarks for folder", () => {
    const logs: string[] = [];
    const spy = jest.spyOn(console, "log").mockImplementation((msg) => logs.push(msg));

    const p = new Command();
    p.exitOverride();
    registerGroupCommand(p);
    p.parse(["node", "test", "group", "show", "reading", "--store", storePath]);

    expect(logs.some((l) => l.includes("NYT"))).toBe(true);
    expect(logs.some((l) => l.includes("GH"))).toBe(false);

    spy.mockRestore();
  });
});
