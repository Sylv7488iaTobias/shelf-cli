import fs from "fs";
import path from "path";

export interface Bookmark {
  id: string;
  url: string;
  title: string;
  tags: string[];
  createdAt: string;
}

export interface BookmarkStore {
  bookmarks: Bookmark[];
}

const DEFAULT_STORE: BookmarkStore = { bookmarks: [] };

export function getStorePath(baseDir: string): string {
  return path.join(baseDir, "bookmarks.json");
}

export function loadStore(baseDir: string): BookmarkStore {
  const storePath = getStorePath(baseDir);
  if (!fs.existsSync(storePath)) {
    return { ...DEFAULT_STORE };
  }
  try {
    const raw = fs.readFileSync(storePath, "utf-8");
    return JSON.parse(raw) as BookmarkStore;
  } catch {
    throw new Error(`Failed to parse bookmark store at ${storePath}`);
  }
}

export function saveStore(baseDir: string, store: BookmarkStore): void {
  const storePath = getStorePath(baseDir);
  fs.mkdirSync(baseDir, { recursive: true });
  fs.writeFileSync(storePath, JSON.stringify(store, null, 2), "utf-8");
}

export function addBookmark(
  store: BookmarkStore,
  bookmark: Omit<Bookmark, "id" | "createdAt">
): Bookmark {
  const newBookmark: Bookmark = {
    ...bookmark,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  store.bookmarks.push(newBookmark);
  return newBookmark;
}

export function removeBookmark(store: BookmarkStore, id: string): boolean {
  const index = store.bookmarks.findIndex((b) => b.id === id);
  if (index === -1) return false;
  store.bookmarks.splice(index, 1);
  return true;
}

export function findBookmarks(
  store: BookmarkStore,
  query: { tag?: string; search?: string }
): Bookmark[] {
  return store.bookmarks.filter((b) => {
    if (query.tag && !b.tags.includes(query.tag)) return false;
    if (
      query.search &&
      !b.title.toLowerCase().includes(query.search.toLowerCase()) &&
      !b.url.toLowerCase().includes(query.search.toLowerCase())
    )
      return false;
    return true;
  });
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}
