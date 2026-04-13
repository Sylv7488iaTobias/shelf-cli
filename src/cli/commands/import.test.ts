import { Command } from "commander";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { importFromCSV } from "./import";
import { loadStore, saveStore } from "../../store/bookmarkStore";

function makeTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "shelf-import-test-"));
}

function makeStorePath(dir: string): string {
  const storePath = path.join(dir, "bookmarks.json");
  saveStore(storePath, { bookmarks: [] });
  return storePath;
}

describe("importFromCSV", () => {
  let tmpDir: string;
  let storePath: string;

  beforeEach(() => {
    tmpDir = makeTempDir();
    storePath = makeStorePath(tmpDir);
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("imports valid bookmarks from a CSV file", () => {
    const csvPath = path.join(tmpDir, "bookmarks.csv");
    fs.writeFileSync(csvPath, "url,title,tags\nhttps://example.com,Example,dev;web\nhttps://github.com,GitHub,dev");

    const result = importFromCSV(csvPath, storePath);

    expect(result.added).toBe(2);
    expect(result.skipped).toBe(0);
    expect(result.errors).toHaveLength(0);

    const store = loadStore(storePath);
    expect(store.bookmarks).toHaveLength(2);
    expect(store.bookmarks[0].url).toBe("https://example.com");
    expect(store.bookmarks[0].tags).toEqual(["dev", "web"]);
  });

  it("skips duplicate bookmarks", () => {
    const csvPath = path.join(tmpDir, "bookmarks.csv");
    fs.writeFileSync(csvPath, "https://example.com,Example,dev");

    importFromCSV(csvPath, storePath);
    const result = importFromCSV(csvPath, storePath);

    expect(result.added).toBe(0);
    expect(result.skipped).toBe(1);
  });

  it("records errors for invalid URLs", () => {
    const csvPath = path.join(tmpDir, "bad.csv");
    fs.writeFileSync(csvPath, "not-a-url,Bad Entry,");

    const result = importFromCSV(csvPath, storePath);

    expect(result.added).toBe(0);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain("invalid or missing URL");
  });

  it("handles CSV without header row", () => {
    const csvPath = path.join(tmpDir, "noheader.csv");
    fs.writeFileSync(csvPath, "https://openai.com,OpenAI,ai");

    const result = importFromCSV(csvPath, storePath);

    expect(result.added).toBe(1);
    const store = loadStore(storePath);
    expect(store.bookmarks[0].url).toBe("https://openai.com");
  });

  it("handles bookmarks with no tags", () => {
    const csvPath = path.join(tmpDir, "notags.csv");
    fs.writeFileSync(csvPath, "https://example.org,Example Org,");

    const result = importFromCSV(csvPath, storePath);

    expect(result.added).toBe(1);
    const store = loadStore(storePath);
    expect(store.bookmarks[0].tags).toEqual([]);
  });
});
