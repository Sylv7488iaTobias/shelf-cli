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

/** Helper to build a minimal bookmark object with sensible defaults. */
function makeBookmark(
  overrides: Partial<{ name: string; url: string; tags: string[]; pinned: boolean; createdAt: string }> = {}
) {
  return {
    name: "Test",
    url: "https://example.com",
    tags: [] as string[],
    pinned: false,
    ...overrides,
  };
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
        makeBookmark({ name: "A", url: "https://a.com" }),
        makeBookmark({ name: "B", url: "https://b.com" }),
      ],
    });
    const stats = computeStats(storePath);
    expect(stats.totalBookmarks).toBe(2);
  });

  it("counts pinned bookmarks", () => {
    saveStore(storePath, {
      bookmarks: [
        makeBookmark({ name: "A", url: "https://a.com", pinned: true }),
        makeBookmark({ name: "B", url: "https://b.com", pinned: false }),
      ],
    });
    const stats = computeStats(storePath);
    expect(stats.pinnedCount).toBe(1);
  });

  it("aggregates tag counts and returns top tags", () => {
    saveStore(storePath, {
      bookmarks: [
        makeBookmark({ name: "A", url: "https://a.com", tags: ["dev", "ts"] }),
        makeBookmark({ name: "B", url: "https://b.com", tags: ["dev"] }),
        makeBookmark({ name: "C", url: "https://c.com", tags: ["ts", "tools"] }),
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
        makeBookmark({ name: "Old", url: "https://old.com", createdAt: "2023-01-01T00:00:00Z" }),
        makeBookmark({ name: "New", url: "https://new.com", createdAt: "2024-06-01T00:00:00Z" }),
      ],
    });
    const stats = computeStats(storePath);
    expect(stats.recentlyAdded[0].name).toBe("New");
  });
});
