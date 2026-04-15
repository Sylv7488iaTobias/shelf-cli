import { Command } from "commander";
import { loadStore, saveStore, getStorePath } from "../../store/bookmarkStore";

/**
 * Sets the `createdAt` and/or `updatedAt` fields of a bookmark
 * to an explicit ISO date string — useful for migrations or corrections.
 */
export function registerTouchCommand(program: Command): void {
  program
    .command("touch <name>")
    .description("Set createdAt and/or updatedAt on a bookmark to a specific date")
    .option("-s, --store <path>", "Path to bookmark store")
    .option("-c, --created <iso>", "Set createdAt to this ISO date string")
    .option("-u, --updated <iso>", "Set updatedAt to this ISO date string")
    .action(
      async (
        name: string,
        options: { store?: string; created?: string; updated?: string }
      ) => {
        if (!options.created && !options.updated) {
          console.error("Provide at least one of --created or --updated.");
          process.exit(1);
        }

        const storePath = getStorePath(options.store);
        const store = await loadStore(storePath);

        const bookmark = store.bookmarks.find(
          (b) => b.name.toLowerCase() === name.toLowerCase()
        );

        if (!bookmark) {
          console.error(`No bookmark found with name "${name}".`);
          process.exit(1);
        }

        if (options.created) {
          if (isNaN(Date.parse(options.created))) {
            console.error(`Invalid date for --created: "${options.created}"`);
            process.exit(1);
          }
          bookmark.createdAt = new Date(options.created).toISOString();
        }

        if (options.updated) {
          if (isNaN(Date.parse(options.updated))) {
            console.error(`Invalid date for --updated: "${options.updated}"`);
            process.exit(1);
          }
          bookmark.updatedAt = new Date(options.updated).toISOString();
        }

        await saveStore(storePath, store);
        console.log(`Touched "${bookmark.name}"`);
        if (options.created) console.log(`  createdAt → ${bookmark.createdAt}`);
        if (options.updated) console.log(`  updatedAt → ${bookmark.updatedAt}`);
      }
    );
}
