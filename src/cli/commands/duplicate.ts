import { Command } from 'commander';
import { loadStore, saveStore } from '../../store/bookmarkStore';
import { Bookmark } from '../../store/bookmarkStore';

export function registerDuplicateCommand(program: Command): void {
  program
    .command('duplicate <id>')
    .description('Duplicate a bookmark with a new name and optional URL override')
    .option('-n, --name <name>', 'Name for the duplicated bookmark')
    .option('-u, --url <url>', 'Override URL for the duplicated bookmark')
    .option('-s, --store <path>', 'Path to the bookmark store')
    .action(async (id: string, options: { name?: string; url?: string; store?: string }) => {
      try {
        const store = await loadStore(options.store);
        const source = store.bookmarks.find((b: Bookmark) => b.id === id);

        if (!source) {
          console.error(`Bookmark with id "${id}" not found.`);
          process.exit(1);
        }

        const newId = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        const newName = options.name ?? `${source.name} (copy)`;
        const newUrl = options.url ?? source.url;

        const duplicate: Bookmark = {
          ...source,
          id: newId,
          name: newName,
          url: newUrl,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        store.bookmarks.push(duplicate);
        await saveStore(store, options.store);

        console.log(`Duplicated "${source.name}" as "${newName}" (id: ${newId})`);
      } catch (err) {
        console.error('Failed to duplicate bookmark:', (err as Error).message);
        process.exit(1);
      }
    });
}
