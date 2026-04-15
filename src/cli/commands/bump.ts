import { Command } from "commander";
import { loadStore, saveStore, getStorePath } from "../../store/bookmarkStore";

/**
 * Updates the `updatedAt` timestamp of a bookmark to now,
 * effectively "bumping" it to the top of recency-sorted lists.
 */
export function registerBumpCommand(program: Command): void {
  program
    .command("bump <name>")
    .description("Refresh the updatedAt timestamp of a bookmark")
    .option("-s, --store <path>", "Path to bookmark store")
    .action(async (name: string, options: { store?: string }) => {
      const storePath = getStorePath(options.store);
      const store = await loadStore(storePath);

      const bookmark = store.bookmarks.find(
        (b) => b.name.toLowerCase() === name.toLowerCase()
      );

      if (!bookmark) {
        console.error(`No bookmark found with name "${name}".`);
        process.exit(1);
      }

      const previous = bookmark.updatedAt;
      bookmark.updatedAt = new Date().toISOString();

      await saveStore(storePath, store);

      console.log(`Bumped "${bookmark.name}"`);
      if (previous) {
        console.log(`  Previous: ${previous}`);
      }
      console.log(`  Now:      ${bookmark.updatedAt}`);
    });
}
