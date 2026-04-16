import { Command } from 'commander';
import { loadStore, saveStore, getStorePath } from '../../store/bookmarkStore';

export type Visibility = 'public' | 'private' | 'unlisted';

export function isVisibility(value: string): value is Visibility {
  return ['public', 'private', 'unlisted'].includes(value);
}

export function registerVisibilityCommand(program: Command): void {
  program
    .command('visibility <name> <level>')
    .description('Set visibility of a bookmark (public, private, unlisted)')
    .option('-s, --store <path>', 'path to bookmark store')
    .action(async (name: string, level: string, options: { store?: string }) => {
      if (!isVisibility(level)) {
        console.error(`Invalid visibility level "${level}". Must be: public, private, or unlisted.`);
        process.exit(1);
      }

      const storePath = options.store ?? getStorePath();
      const store = await loadStore(storePath);
      const bookmark = store.bookmarks.find((b) => b.name === name);

      if (!bookmark) {
        console.error(`Bookmark "${name}" not found.`);
        process.exit(1);
      }

      (bookmark as any).visibility = level;
      await saveStore(storePath, store);
      console.log(`Visibility of "${name}" set to "${level}".`);
    });
}
