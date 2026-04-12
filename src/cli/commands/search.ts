import { Command } from 'commander';
import { loadStore } from '../../store/bookmarkStore';
import { searchBookmarks } from '../../search/searchBookmarks';
import { formatSearchResults } from '../../search/index';

export function registerSearchCommand(program: Command): void {
  program
    .command('search <query>')
    .description('Search bookmarks by URL, title, or tags')
    .option('-t, --tag <tag>', 'Filter results by tag')
    .option('-l, --limit <number>', 'Maximum number of results to show', '10')
    .option('--json', 'Output results as JSON')
    .action(async (query: string, options: { tag?: string; limit: string; json?: boolean }) => {
      try {
        const store = await loadStore();
        const limit = parseInt(options.limit, 10);

        if (isNaN(limit) || limit <= 0) {
          console.error('Error: --limit must be a positive integer');
          process.exit(1);
        }

        let results = searchBookmarks(store.bookmarks, query);

        if (options.tag) {
          results = results.filter((b) =>
            b.tags?.some((t) => t.toLowerCase() === options.tag!.toLowerCase())
          );
        }

        results = results.slice(0, limit);

        if (results.length === 0) {
          console.log(`No bookmarks found matching "${query}"`);
          return;
        }

        if (options.json) {
          console.log(JSON.stringify(results, null, 2));
        } else {
          console.log(formatSearchResults(results));
        }
      } catch (err) {
        console.error('Error searching bookmarks:', (err as Error).message);
        process.exit(1);
      }
    });
}
