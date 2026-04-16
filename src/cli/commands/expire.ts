import { Command } from 'commander';
import { loadStore, saveStore, getStorePath } from '../../store/bookmarkStore';

export function registerExpireCommand(program: Command): void {
  program
    .command('expire')
    .description('Remove or list bookmarks older than a given number of days')
    .argument('<days>', 'Age threshold in days', parseInt)
    .option('--dry-run', 'List expired bookmarks without removing them')
    .option('--store <path>', 'Path to bookmark store')
    .action(async (days: number, options: { dryRun?: boolean; store?: string }) => {
      const storePath = options.store ?? getStorePath();
      const store = await loadStore(storePath);

      if (isNaN(days) || days < 0) {
        console.error('Error: days must be a non-negative integer');
        process.exit(1);
      }

      const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;

      const expired = store.bookmarks.filter((b) => {
        const created = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return created < cutoff;
      });

      if (expired.length === 0) {
        console.log(`No bookmarks older than ${days} day(s) found.`);
        return;
      }

      if (options.dryRun) {
        console.log(`Found ${expired.length} bookmark(s) older than ${days} day(s):`);
        for (const b of expired) {
          console.log(`  [${b.id}] ${b.name} — ${b.url}`);
        }
        return;
      }

      const remaining = store.bookmarks.filter((b) => {
        const created = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return created >= cutoff;
      });

      store.bookmarks = remaining;
      await saveStore(storePath, store);
      console.log(`Removed ${expired.length} bookmark(s) older than ${days} day(s).`);
    });
}
