import { Command } from 'commander';
import { loadStore, saveStore } from '../../store/bookmarkStore';

export function registerLabelCommand(program: Command): void {
  program
    .command('label <name> <label>')
    .description('Set a custom display label on a bookmark')
    .option('-s, --store <path>', 'Path to bookmark store')
    .option('--clear', 'Remove the label from the bookmark')
    .action(async (name: string, label: string, opts) => {
      const store = await loadStore(opts.store);
      const bookmark = store.bookmarks.find((b) => b.name === name);

      if (!bookmark) {
        console.error(`Bookmark "${name}" not found.`);
        process.exit(1);
      }

      if (opts.clear) {
        delete (bookmark as any).label;
        await saveStore(opts.store, store);
        console.log(`Label removed from "${name}".`);
        return;
      }

      (bookmark as any).label = label;
      await saveStore(opts.store, store);
      console.log(`Label "${label}" set on "${name}".`);
    });
}
