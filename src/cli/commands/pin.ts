import { Command } from "commander";
import { loadStore, saveStore } from "../../store/bookmarkStore";
import { commitBookmarkChanges } from "../../sync";

export function registerPinCommand(program: Command): void {
  program
    .command("pin <name>")
    .description("Pin or unpin a bookmark to keep it at the top of listings")
    .option("--unpin", "Remove pin from bookmark")
    .option("--store <path>", "Path to bookmark store")
    .option("--no-sync", "Skip syncing changes to remote")
    .action(async (name: string, options: { unpin?: boolean; store?: string; sync: boolean }) => {
      try {
        const store = await loadStore(options.store);
        const bookmark = store.bookmarks.find((b) => b.name === name);

        if (!bookmark) {
          console.error(`Bookmark "${name}" not found.`);
          process.exit(1);
        }

        const wasPinned = bookmark.pinned === true;
        const shouldPin = !options.unpin;

        if (shouldPin && wasPinned) {
          console.log(`Bookmark "${name}" is already pinned.`);
          return;
        }

        if (!shouldPin && !wasPinned) {
          console.log(`Bookmark "${name}" is not pinned.`);
          return;
        }

        bookmark.pinned = shouldPin;
        await saveStore(store, options.store);

        const action = shouldPin ? "Pinned" : "Unpinned";
        console.log(`${action} bookmark "${name}".`);

        if (options.sync !== false) {
          await commitBookmarkChanges(`${action.toLowerCase()} bookmark: ${name}`, options.store);
        }
      } catch (err) {
        console.error("Error updating bookmark pin:", (err as Error).message);
        process.exit(1);
      }
    });
}
