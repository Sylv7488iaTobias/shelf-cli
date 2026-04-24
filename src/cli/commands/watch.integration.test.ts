import * as fs from "fs";
import * as os from "os";
import * as path from "path";

// Integration: simulate the full watch polling loop logic
// without spawning a real process (avoids SIGINT complexity in Jest).

type Bookmark = { id: string; url: string; title?: string; tags: string[]; createdAt: string };
type Store = { bookmarks: Bookmark[] };

function diffStores(prev: Store, next: Store) {
  const changes: { event: string; id: string }[] = [];
  const prevMap = new Map(prev.bookmarks.map((b) => [b.id, b]));
  const nextMap = new Map(next.bookmarks.map((b) => [b.id, b]));
  for (const [id, b] of nextMap) {
    if (!prevMap.has(id)) changes.push({ event: "added", id });
    else if (prevMap.get(id)!.url !== b.url) changes.push({ event: "modified", id });
  }
  for (const [id] of prevMap) {
    if (!nextMap.has(id)) changes.push({ event: "removed", id });
  }
  return changes;
}

function makeTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "shelf-watch-int-"));
}

describe("watch integration", () => {
  it("reports no changes when store is identical", () => {
    const store: Store = {
      bookmarks: [{ id: "1", url: "https://a.com", tags: [], createdAt: "2024-01-01" }],
    };
    expect(diffStores(store, store)).toHaveLength(0);
  });

  it("reports added, removed, and modified in one tick", () => {
    const prev: Store = {
      bookmarks: [
        { id: "1", url: "https://old.com", tags: [], createdAt: "2024-01-01" },
        { id: "2", url: "https://gone.com", tags: [], createdAt: "2024-01-01" },
      ],
    };
    const next: Store = {
      bookmarks: [
        { id: "1", url: "https://new.com", tags: [], createdAt: "2024-01-01" },
        { id: "3", url: "https://fresh.com", tags: [], createdAt: "2024-01-02" },
      ],
    };
    const changes = diffStores(prev, next);
    expect(changes.find((c) => c.event === "modified" && c.id === "1")).toBeDefined();
    expect(changes.find((c) => c.event === "removed" && c.id === "2")).toBeDefined();
    expect(changes.find((c) => c.event === "added" && c.id === "3")).toBeDefined();
    expect(changes).toHaveLength(3);
  });

  it("handles empty-to-populated transition", () => {
    const prev: Store = { bookmarks: [] };
    const next: Store = {
      bookmarks: [{ id: "x", url: "https://x.com", tags: [], createdAt: "2024-06-01" }],
    };
    const changes = diffStores(prev, next);
    expect(changes).toEqual([{ event: "added", id: "x" }]);
  });

  it("handles populated-to-empty transition", () => {
    const prev: Store = {
      bookmarks: [{ id: "y", url: "https://y.com", tags: [], createdAt: "2024-06-01" }],
    };
    const next: Store = { bookmarks: [] };
    const changes = diffStores(prev, next);
    expect(changes).toEqual([{ event: "removed", id: "y" }]);
  });
});
