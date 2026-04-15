import { Command } from "commander";
import { filterBookmarks } from "./filter";
import { Bookmark } from "../../store/bookmarkStore";

function makeBookmark(overrides: Partial<Bookmark> = {}): Bookmark {
  return {
    id: "abc123",
    name: "Test",
    url: "https://example.com",
    tags: [],
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

describe("filterBookmarks", () => {
  it("returns all bookmarks when no filters applied", () => {
    const bookmarks = [makeBookmark(), makeBookmark({ id: "xyz" })];
    expect(filterBookmarks(bookmarks, {})).toHaveLength(2);
  });

  it("filters by folder", () => {
    const bookmarks = [
      makeBookmark({ folder: "work" }),
      makeBookmark({ folder: "personal" }),
      makeBookmark(),
    ];
    const result = filterBookmarks(bookmarks, { folder: "work" });
    expect(result).toHaveLength(1);
    expect(result[0].folder).toBe("work");
  });

  it("filters pinned bookmarks", () => {
    const bookmarks = [
      makeBookmark({ pinned: true }),
      makeBookmark({ pinned: false }),
      makeBookmark(),
    ];
    const result = filterBookmarks(bookmarks, { pinned: true });
    expect(result).toHaveLength(1);
    expect(result[0].pinned).toBe(true);
  });

  it("excludes pinned bookmarks when pinned=false", () => {
    const bookmarks = [
      makeBookmark({ pinned: true }),
      makeBookmark({ pinned: false }),
      makeBookmark(),
    ];
    const result = filterBookmarks(bookmarks, { pinned: false });
    expect(result).toHaveLength(2);
    result.forEach((b) => expect(b.pinned).not.toBe(true));
  });

  it("filters archived bookmarks", () => {
    const bookmarks = [
      makeBookmark({ archived: true }),
      makeBookmark({ archived: false }),
    ];
    const result = filterBookmarks(bookmarks, { archived: true });
    expect(result).toHaveLength(1);
  });

  it("filters favorite bookmarks", () => {
    const bookmarks = [
      makeBookmark({ favorite: true }),
      makeBookmark(),
    ];
    const result = filterBookmarks(bookmarks, { favorite: true });
    expect(result).toHaveLength(1);
  });

  it("filters bookmarks with notes", () => {
    const bookmarks = [
      makeBookmark({ notes: "some note" }),
      makeBookmark(),
    ];
    const result = filterBookmarks(bookmarks, { hasNotes: true });
    expect(result).toHaveLength(1);
    expect(result[0].notes).toBe("some note");
  });

  it("combines multiple filters", () => {
    const bookmarks = [
      makeBookmark({ folder: "work", pinned: true }),
      makeBookmark({ folder: "work", pinned: false }),
      makeBookmark({ folder: "personal", pinned: true }),
    ];
    const result = filterBookmarks(bookmarks, { folder: "work", pinned: true });
    expect(result).toHaveLength(1);
    expect(result[0].folder).toBe("work");
    expect(result[0].pinned).toBe(true);
  });
});
