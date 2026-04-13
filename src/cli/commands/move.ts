import { Command } from "commander";
import { loadStore, saveStore } from "../../store/bookmarkStore";

export function registerMoveCommand(program: Command): void {
  program
    .command("move <name> <newFolder>")
    .alias("mv")
    .description("Move a bookmark into a folder (sets or updates its folder tag)")
    .option("-s, --store <path>", "path to bookmark store")
    .action(async (name: string, newFolder: string, opts: { store?: string }) => {
      try {
        const store = await loadStore(opts.store);
        const bookmark = store.bookmarks.find((b) => b.name === name);

        if (!bookmark) {
          console.error(`Bookmark "${name}" not found.`);
          process.exit(1);
        }

        // Remove any existing folder: tags
        bookmark.tags = (bookmark.tags ?? []).filter(
          (t) => !t.startsWith("folder:")
        );

        // Add new folder tag
        bookmark.tags.push(`folder:${newFolder}`);

        await saveStore(store, opts.store);
        console.log(`Moved "${name}" to folder "${newFolder}".`);
      } catch (err) {
        console.error("Error moving bookmark:", (err as Error).message);
        process.exit(1);
      }
    });
}
