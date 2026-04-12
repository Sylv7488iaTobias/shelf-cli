import { Command } from 'commander';
import { loadStore } from '../../store/bookmarkStore';
import { formatSearchResults } from '../../search/index';
import { Bookmark } from '../../store/bookmarkStore';

export function registerListCommand(program: Command): void {
  program
    .command('list')
    .description('List all saved bookmarks')
    .option('-t, --tag <tag>', 'Filter bookmarks by tag')
    .option('--json', 'Output as JSON')
    .option('-l, --limit <number>', 'Maximum number of bookmarks to show')
    .action(async (options: { tag?: string; json?: boolean; limit?: string }) => {
      try {
        const store = await loadStore();
        let bookmarks: Bookmark[] = store.bookmarks;

        if (bookmarks.length === 0) {
          console.log('No bookmarks saved yet. Use `shelf add <url>` to add one.');
          return;
        }

        if (options.tag) {
          bookmarks = bookmarks.filter((b) =>
            b.tags?.some((t) => t.toLowerCase() === options.tag!.toLowerCase())
          );
          if (bookmarks.length === 0) {
            console.log(`No bookmarks found with tag "${options.tag}"`);
            return;
          }
        }

        if (options.limit) {
          const limit = parseInt(options.limit, 10);
          if (!isNaN(limit) && limit > 0) {
            bookmarks = bookmarks.slice(0, limit);
          }
        }

        if (options.json) {
          console.log(JSON.stringify(bookmarks, null, 2));
        } else {
          console.log(`Showing ${bookmarks.length} bookmark(s):\n`);
          console.log(formatSearchResults(bookmarks));
        }
      } catch (err) {
        console.error('Error listing bookmarks:', (err as Error).message);
        process.exit(1);
      }
    });
}
