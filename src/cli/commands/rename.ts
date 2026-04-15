import { Command } from "commander";
import { loadStore, saveStore } from "../../store/bookmarkStore";

export function registerRenameCommand(program: Command): void {
  program
    .command("rename <oldName> <newName>")
    .description("Rename a bookmark by its current name")
    .option("-s, --store <path>", "path to bookmark store")
    .action(async (oldName: string, newName: string, opts: { store?: string }) => {
      try {
        const store = await loadStore(opts.store);

        const index = store.bookmarks.findIndex(
          (b) => b.name.toLowerCase() === oldName.toLowerCase()
        );

        if (index === -1) {
          console.error(`No bookmark found with name: ${oldName}`);
          process.exit(1);
        }

        const conflict = store.bookmarks.find(
          (b) => b.name.toLowerCase() === newName.toLowerCase()
        );

        if (conflict) {
          console.error(`A bookmark named "${newName}" already exists.`);
          process.exit(1);
        }

        store.bookmarks[index] = {
          ...store.bookmarks[index],
          name: newName,
        };

        await saveStore(store, opts.store);
        console.log(`Renamed "${oldName}" → "${newName}"`);
      } catch (err) {
        console.error("Failed to rename bookmark:", (err as Error).message);
        process.exit(1);
      }
    });
}
