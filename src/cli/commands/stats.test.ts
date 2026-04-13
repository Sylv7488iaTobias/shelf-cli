import { Command } from "commander";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { computeStats } from "./stats";
import { saveStore } from "../../store/bookmarkStore";
import type { BookmarkStore } from "../../store/bookmarkStore";

function makeTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "shelf-stats-test-"));
}

function makeStorePath(dir: string): string {
  return path.join(dir, "bookmarks.json");
}

describe("computeStats", () => {
  let tmpDir: string;
  let storePath: string;

  beforeEach(() => {
    tmpDir = makeTempDir();
    storePath = makeStorePath(tmpDir);
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("returns zero counts for an empty store", () => {
    saveStore(storePath, { bookmarks: [] });
    const stats = computeStats(storePath);
    expect(stats.totalBookmarks).toBe(0);
    expect(stats.totalTags).toBe(0);
    expect(stats.pinnedCount).toBe(0);
    expect(stats.topTags).toHaveLength(0);
    expect(stats.recentlyAdded).toHaveLength(0);
  });

  it("counts total bookmarks correctly", () => {
    saveStore(storePath, {
      bookmarks: [
        { name: "A", url: "https://a.com", tags: [], pinned: false },
        { name: "B", url: "https://b.com", tags: [], pinned: false },
      ],
    });
    const stats = computeStats(storePath);
    expect(stats.totalBookmarks).toBe(2);
  });

  it("counts pinned bookmarks", () => {
    saveStore(storePath, {
      bookmarks: [
        { name: "A", url: "https://a.com", tags: [], pinned: true },
        { name: "B", url: "https://b.com", tags: [], pinned: false },
      ],
    });
    const stats = computeStats(storePath);
    expect(stats.pinnedCount).toBe(1);
  });

  it("aggregates tag counts and returns top tags", () => {
    saveStore(storePath, {
      bookmarks: [
        { name: "A", url: "https://a.com", tags: ["dev", "ts"], pinned: false },
        { name: "B", url: "https://b.com", tags: ["dev"], pinned: false },
        { name: "C", url: "https://c.com", tags: ["ts", "tools"], pinned: false },
      ],
    });
    const stats = computeStats(storePath);
    expect(stats.totalTags).toBe(3);
    expect(stats.topTags[0].tag).toBe("dev");
    expect(stats.topTags[0].count).toBe(2);
  });

  it("returns recently added sorted by date", () => {
    saveStore(storePath, {
      bookmarks: [
        { name: "Old", url: "https://old.com", tags: [], pinned: false, createdAt: "2023-01-01T00:00:00Z" },
        { name: "New", url: "https://new.com", tags: [], pinned: false, createdAt: "2024-06-01T00:00:00Z" },
      ],
    });
    const stats = computeStats(storePath);
    expect(stats.recentlyAdded[0].name).toBe("New");
  });
});
