import { Command } from "commander";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { parseBatchFile, registerBatchCommand } from "./batch";
import { loadStore, saveStore } from "../../store/bookmarkStore";

function makeTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "shelf-batch-test-"));
}

function makeProgram(): Command {
  const program = new Command();
  program.exitOverride();
  registerBatchCommand(program);
  return program;
}

describe("parseBatchFile", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = makeTempDir();
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("parses a valid batch JSON file", () => {
    const file = path.join(tmpDir, "batch.json");
    fs.writeFileSync(
      file,
      JSON.stringify([
        { url: "https://example.com", name: "Example", tags: ["web"], folder: "work" },
        { url: "https://test.com", name: "Test" },
      ])
    );
    const entries = parseBatchFile(file);
    expect(entries).toHaveLength(2);
    expect(entries[0].url).toBe("https://example.com");
    expect(entries[0].tags).toEqual(["web"]);
    expect(entries[0].folder).toBe("work");
    expect(entries[1].tags).toEqual([]);
    expect(entries[1].folder).toBeUndefined();
  });

  it("throws on invalid JSON", () => {
    const file = path.join(tmpDir, "bad.json");
    fs.writeFileSync(file, "not json");
    expect(() => parseBatchFile(file)).toThrow("Invalid JSON");
  });

  it("throws when file is not an array", () => {
    const file = path.join(tmpDir, "obj.json");
    fs.writeFileSync(file, JSON.stringify({ url: "https://x.com", name: "X" }));
    expect(() => parseBatchFile(file)).toThrow("JSON array");
  });

  it("throws when an entry is missing url", () => {
    const file = path.join(tmpDir, "nourl.json");
    fs.writeFileSync(file, JSON.stringify([{ name: "No URL" }]));
    expect(() => parseBatchFile(file)).toThrow("url");
  });
});

describe("batch command", () => {
  let tmpDir: string;
  let storePath: string;

  beforeEach(() => {
    tmpDir = makeTempDir();
    storePath = path.join(tmpDir, "bookmarks.json");
    process.env.SHELF_STORE_PATH = storePath;
  });

  afterEach(() => {
    delete process.env.SHELF_STORE_PATH;
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("adds bookmarks from a batch file", () => {
    const batchFile = path.join(tmpDir, "batch.json");
    fs.writeFileSync(
      batchFile,
      JSON.stringify([
        { url: "https://a.com", name: "A", tags: ["alpha"] },
        { url: "https://b.com", name: "B" },
      ])
    );
    const program = makeProgram();
    program.parse(["node", "shelf", "batch", batchFile]);
    const store = loadStore(storePath);
    expect(store.bookmarks).toHaveLength(2);
    expect(store.bookmarks[0].url).toBe("https://a.com");
  });

  it("skips duplicate URLs", () => {
    const store = loadStore(storePath);
    store.bookmarks.push({ id: "1", url: "https://a.com", name: "A", tags: [], createdAt: new Date().toISOString() });
    saveStore(store, storePath);

    const batchFile = path.join(tmpDir, "batch.json");
    fs.writeFileSync(batchFile, JSON.stringify([{ url: "https://a.com", name: "A Dup" }]));
    const program = makeProgram();
    program.parse(["node", "shelf", "batch", batchFile]);
    const updated = loadStore(storePath);
    expect(updated.bookmarks).toHaveLength(1);
  });

  it("prints preview in dry-run mode without saving", () => {
    const batchFile = path.join(tmpDir, "batch.json");
    fs.writeFileSync(batchFile, JSON.stringify([{ url: "https://dry.com", name: "Dry" }]));
    const spy = jest.spyOn(console, "log").mockImplementation(() => {});
    const program = makeProgram();
    program.parse(["node", "shelf", "batch", "--dry-run", batchFile]);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining("Dry run"));
    const store = loadStore(storePath);
    expect(store.bookmarks).toHaveLength(0);
    spy.mockRestore();
  });
});
