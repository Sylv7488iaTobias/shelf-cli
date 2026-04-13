import { Command } from "commander";
import { loadStore, saveStore, getStorePath } from "../../store/bookmarkStore";

export function registerNotesCommand(program: Command): void {
  program
    .command("notes <name>")
    .description("View or set a note on a bookmark")
    .option("-s, --set <note>", "Set the note text for the bookmark")
    .option("-c, --clear", "Clear the note from the bookmark")
    .action(async (name: string, options: { set?: string; clear?: boolean }) => {
      const storePath = getStorePath();
      const store = loadStore(storePath);

      const bookmark = store.bookmarks.find((b) => b.name === name);

      if (!bookmark) {
        console.error(`Bookmark "${name}" not found.`);
        process.exit(1);
      }

      if (options.clear) {
        delete bookmark.notes;
        saveStore(storePath, store);
        console.log(`Notes cleared for "${name}".`);
        return;
      }

      if (options.set !== undefined) {
        bookmark.notes = options.set;
        saveStore(storePath, store);
        console.log(`Notes updated for "${name}".`);
        return;
      }

      // View mode
      if (bookmark.notes) {
        console.log(`Notes for "${name}":\n${bookmark.notes}`);
      } else {
        console.log(`No notes set for "${name}".`);
      }
    });
}
