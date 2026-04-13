import { Bookmark } from "../store/bookmarkStore";

export interface SearchOptions {
  query: string;
  tags?: string[];
  archived?: boolean;
  pinned?: boolean;
}

export function matchesQuery(bookmark: Bookmark, query: string): boolean {
  const q = query.toLowerCase();
  return (
    bookmark.name.toLowerCase().includes(q) ||
    bookmark.url.toLowerCase().includes(q) ||
    (bookmark.notes?.toLowerCase().includes(q) ?? false)
  );
}

export function matchesTags(bookmark: Bookmark, tags: string[]): boolean {
  if (tags.length === 0) return true;
  return tags.every((tag) => bookmark.tags.includes(tag));
}

export function searchBookmarks(
  bookmarks: Bookmark[],
  options: SearchOptions
): Bookmark[] {
  const { query, tags = [], archived, pinned } = options;

  return bookmarks.filter((b) => {
    if (archived !== undefined && (b.archived ?? false) !== archived) return false;
    if (pinned !== undefined && (b.pinned ?? false) !== pinned) return false;
    if (tags.length > 0 && !matchesTags(b, tags)) return false;
    if (query && !matchesQuery(b, query)) return false;
    return true;
  });
}
