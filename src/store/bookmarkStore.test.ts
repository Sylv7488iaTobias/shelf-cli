import fs from "fs";
import path from "path";
import os from "os";
import {
  loadStore,
  saveStore,
  addBookmark,
  removeBookmark,
  findBookmarks,
  BookmarkStore,
} from "./bookmarkStore";

function makeTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "shelf-test-"));
}

describe("bookmarkStore", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = makeTempDir();
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  test("loadStore returns empty store when file does not exist", () => {
    const store = loadStore(tempDir);
    expect(store.bookmarks).toEqual([]);
  });

  test("saveStore and loadStore round-trip", () => {
    const store: BookmarkStore = {
      bookmarks: [
        {
          id: "abc123",
          url: "https://example.com",
          title: "Example",
          tags: ["test"],
          createdAt: new Date().toISOString(),
        },
      ],
    };
    saveStore(tempDir, store);
    const loaded = loadStore(tempDir);
    expect(loaded.bookmarks).toHaveLength(1);
    expect(loaded.bookmarks[0].url).toBe("https://example.com");
  });

  test("addBookmark assigns id and createdAt", () => {
    const store = loadStore(tempDir);
    const bookmark = addBookmark(store, {
      url: "https://github.com",
      title: "GitHub",
      tags: ["dev"],
    });
    expect(bookmark.id).toBeTruthy();
    expect(bookmark.createdAt).toBeTruthy();
    expect(store.bookmarks).toHaveLength(1);
  });

  test("removeBookmark removes by id", () => {
    const store = loadStore(tempDir);
    const bookmark = addBookmark(store, {
      url: "https://github.com",
      title: "GitHub",
      tags: [],
    });
    const removed = removeBookmark(store, bookmark.id);
    expect(removed).toBe(true);
    expect(store.bookmarks).toHaveLength(0);
  });

  test("removeBookmark returns false for unknown id", () => {
    const store = loadStore(tempDir);
    expect(removeBookmark(store, "nonexistent")).toBe(false);
  });

  test("findBookmarks filters by tag", () => {
    const store = loadStore(tempDir);
    addBookmark(store, { url: "https://a.com", title: "A", tags: ["work"] });
    addBookmark(store, { url: "https://b.com", title: "B", tags: ["personal"] });
    const results = findBookmarks(store, { tag: "work" });
    expect(results).toHaveLength(1);
    expect(results[0].url).toBe("https://a.com");
  });

  test("findBookmarks filters by search term", () => {
    const store = loadStore(tempDir);
    addBookmark(store, { url: "https://docs.rust-lang.org", title: "Rust Docs", tags: [] });
    addBookmark(store, { url: "https://nodejs.org", title: "Node.js", tags: [] });
    const results = findBookmarks(store, { search: "rust" });
    expect(results).toHaveLength(1);
    expect(results[0].title).toBe("Rust Docs");
  });
});
