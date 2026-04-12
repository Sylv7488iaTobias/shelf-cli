import { Bookmark, loadStore } from '../store/bookmarkStore';

export interface SearchOptions {
  query: string;
  tags?: string[];
  caseSensitive?: boolean;
}

export interface SearchResult {
  bookmark: Bookmark;
  matchedOn: ('title' | 'url' | 'tags' | 'description')[];
}

export function searchBookmarks(
  bookmarks: Bookmark[],
  options: SearchOptions
): SearchResult[] {
  const { query, tags, caseSensitive = false } = options;
  const normalize = (s: string) => (caseSensitive ? s : s.toLowerCase());
  const normalizedQuery = normalize(query);

  const results: SearchResult[] = [];

  for (const bookmark of bookmarks) {
    const matchedOn: SearchResult['matchedOn'] = [];

    if (normalize(bookmark.title).includes(normalizedQuery)) {
      matchedOn.push('title');
    }
    if (normalize(bookmark.url).includes(normalizedQuery)) {
      matchedOn.push('url');
    }
    if (bookmark.description && normalize(bookmark.description).includes(normalizedQuery)) {
      matchedOn.push('description');
    }
    if (bookmark.tags?.some((tag) => normalize(tag).includes(normalizedQuery))) {
      matchedOn.push('tags');
    }

    const tagFilterPassed =
      !tags || tags.length === 0
        ? true
        : tags.every((filterTag) =>
            bookmark.tags?.some((t) => normalize(t) === normalize(filterTag))
          );

    if (matchedOn.length > 0 && tagFilterPassed) {
      results.push({ bookmark, matchedOn });
    }
  }

  return results;
}

export async function searchStore(
  storePath: string,
  options: SearchOptions
): Promise<SearchResult[]> {
  const store = await loadStore(storePath);
  return searchBookmarks(store.bookmarks, options);
}
