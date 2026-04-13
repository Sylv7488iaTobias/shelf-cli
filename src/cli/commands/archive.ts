import { Command } from "commander";
import { loadStore, saveStore, getStorePath } from "../../store/bookmarkStore";

export function registerArchiveCommand(program: Command): void {
  program
    .command("archive <name>")
    .description("Archive or unarchive a bookmark by name")
    .option("-u, --unarchive", "Unarchive a previously archived bookmark")
    .option("-l, --list", "List all archived bookmarks")
    .action(async (name: string, options: { unarchive?: boolean; list?: boolean }) => {
      const storePath = getStorePath();
      const store = loadStore(storePath);

      if (options.list) {
        const archived = store.bookmarks.filter((b) => b.archived);
        if (archived.length === 0) {
          console.log("No archived bookmarks.");
        } else {
          console.log("Archived bookmarks:");
          archived.forEach((b) => {
            console.log(`  [${b.name}] ${b.url}`);
          });
        }
        return;
      }

      const bookmark = store.bookmarks.find((b) => b.name === name);

      if (!bookmark) {
        console.error(`Bookmark "${name}" not found.`);
        process.exit(1);
      }

      if (options.unarchive) {
        if (!bookmark.archived) {
          console.error(`Bookmark "${name}" is not archived.`);
          process.exit(1);
        }
        bookmark.archived = false;
        saveStore(storePath, store);
        console.log(`Bookmark "${name}" has been unarchived.`);
      } else {
        if (bookmark.archived) {
          console.log(`Bookmark "${name}" is already archived.`);
          return;
        }
        bookmark.archived = true;
        saveStore(storePath, store);
        console.log(`Bookmark "${name}" has been archived.`);
      }
    });
}
