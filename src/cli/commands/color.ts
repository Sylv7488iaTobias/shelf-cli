import { Command } from 'commander';
import { loadStore, saveStore } from '../../store/bookmarkStore';

const VALID_COLORS = ['red', 'green', 'blue', 'yellow', 'purple', 'orange', 'pink', 'none'];

export function registerColorCommand(program: Command): void {
  program
    .command('color <name> <color>')
    .description('Assign a color label to a bookmark')
    .option('-s, --store <path>', 'Path to bookmark store')
    .action(async (name: string, color: string, opts) => {
      const normalized = color.toLowerCase();
      if (!VALID_COLORS.includes(normalized)) {
        console.error(`Invalid color. Choose from: ${VALID_COLORS.join(', ')}`);
        process.exit(1);
      }

      const store = await loadStore(opts.store);
      const bookmark = store.bookmarks.find((b) => b.name === name);

      if (!bookmark) {
        console.error(`Bookmark "${name}" not found.`);
        process.exit(1);
      }

      if (normalized === 'none') {
        delete (bookmark as any).color;
        console.log(`Removed color from "${name}".`);
      } else {
        (bookmark as any).color = normalized;
        console.log(`Set color of "${name}" to ${normalized}.`);
      }

      await saveStore(opts.store, store);
    });
}
