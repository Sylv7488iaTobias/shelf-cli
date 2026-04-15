import { Command } from "commander";
import { loadStore, saveStore, getStorePath } from "../../store/bookmarkStore";

export function registerUnarchiveCommand(program: Command): void {
  program
    .command("unarchive <name>")
    .description("Restore an archived bookmark back to active")
    .option("-s, --store <path>", "Path to bookmark store")
    .action(async (name: string, opts: { store?: string }) => {
      const storePath = opts.store ?? getStorePath();
      const store = await loadStore(storePath);

      const bookmark = store.bookmarks.find((b) => b.name === name);

      if (!bookmark) {
        console.error(`No bookmark found with name: ${name}`);
        process.exit(1);
      }

      if (!bookmark.archived) {
        console.log(`Bookmark "${name}" is not archived.`);
        return;
      }

      bookmark.archived = false;

      await saveStore(storePath, store);
      console.log(`Bookmark "${name}" has been restored from archive.`);
    });
}
