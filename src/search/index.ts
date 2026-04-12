import { getStorePath } from '../store/bookmarkStore';
import { searchStore, SearchResult } from './searchBookmarks';

export { searchBookmarks, searchStore } from './searchBookmarks';
export type { SearchOptions, SearchResult } from './searchBookmarks';

export function formatSearchResults(results: SearchResult[]): string {
  if (results.length === 0) {
    return 'No bookmarks found.';
  }

  return results
    .map((result, index) => {
      const { bookmark, matchedOn } = result;
      const tags = bookmark.tags?.length ? `[${bookmark.tags.join(', ')}]` : '';
      const description = bookmark.description ? `  ${bookmark.description}` : '';
      const matched = `(matched: ${matchedOn.join(', ')})`;
      return [
        `${index + 1}. ${bookmark.title} ${tags}`,
        `   ${bookmark.url}`,
        description,
        `   ${matched}`,
      ]
        .filter(Boolean)
        .join('\n');
    })
    .join('\n\n');
}

export async function runSearch(
  query: string,
  options: { tags?: string[]; caseSensitive?: boolean } = {}
): Promise<void> {
  const storePath = getStorePath();
  const results = await searchStore(storePath, {
    query,
    tags: options.tags,
    caseSensitive: options.caseSensitive,
  });
  console.log(formatSearchResults(results));
}
