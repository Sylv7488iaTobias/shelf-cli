import { Command } from "commander";
import { loadStore, saveStore } from "../../store/bookmarkStore";
import { commitBookmarkChanges } from "../../sync";

export function registerRenameCommand(program: Command): void {
  program
    .command("rename <id> <newTitle>")
    .description("Rename a bookmark's title by its ID")
    .option("-s, --sync", "commit and push changes after renaming")
    .action(async (id: string, newTitle: string, options: { sync?: boolean }) => {
      try {
        const store = await loadStore();
        const bookmark = store.bookmarks.find((b) => b.id === id);

        if (!bookmark) {
          console.error(`Error: No bookmark found with ID "${id}"`);
          process.exit(1);
        }

        const oldTitle = bookmark.title;
        bookmark.title = newTitle.trim();

        if (!bookmark.title) {
          console.error("Error: New title cannot be empty.");
          process.exit(1);
        }

        await saveStore(store);
        console.log(`Renamed "${oldTitle}" → "${bookmark.title}"`);

        if (options.sync) {
          await commitBookmarkChanges(`rename bookmark ${id}: "${oldTitle}" → "${bookmark.title}"`);
          console.log("Changes committed and pushed.");
        }
      } catch (err) {
        console.error("Error renaming bookmark:", (err as Error).message);
        process.exit(1);
      }
    });
}
