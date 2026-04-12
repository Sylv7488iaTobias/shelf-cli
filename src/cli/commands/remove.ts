import { Command } from 'commander';
import { loadStore, removeBookmark, saveStore } from '../../store/bookmarkStore';
import { commitBookmarkChanges, syncBookmarks } from '../../sync';

export function registerRemoveCommand(program: Command): void {
  program
    .command('remove <id>')
    .alias('rm')
    .description('Remove a bookmark by its ID')
    .option('--no-sync', 'Skip syncing after removal')
    .action(async (id: string, options: { sync: boolean }) => {
      try {
        const store = await loadStore();

        const existing = store.bookmarks.find((b) => b.id === id);
        if (!existing) {
          console.error(`Error: No bookmark found with ID "${id}"`);
          process.exit(1);
        }

        const updated = removeBookmark(store, id);
        await saveStore(updated);

        console.log(`Removed bookmark: [${existing.id}] ${existing.url}`);
        if (existing.title) {
          console.log(`  Title: ${existing.title}`);
        }

        if (options.sync) {
          try {
            await commitBookmarkChanges(`Remove bookmark ${id}: ${existing.url}`);
            await syncBookmarks();
            console.log('Changes synced successfully.');
          } catch (syncErr) {
            console.warn(
              'Warning: Could not sync changes:',
              syncErr instanceof Error ? syncErr.message : syncErr
            );
          }
        }
      } catch (err) {
        console.error(
          'Error removing bookmark:',
          err instanceof Error ? err.message : err
        );
        process.exit(1);
      }
    });
}
