import { Command } from "commander";
import { loadStore, saveStore } from "../../store/bookmarkStore";

export function reorderBookmarks(
  bookmarks: Array<{ id: string; [key: string]: unknown }>,
  ids: string[]
): Array<{ id: string; [key: string]: unknown }> {
  const idSet = new Set(ids);
  const reordered = ids
    .map((id) => bookmarks.find((b) => b.id === id))
    .filter((b): b is { id: string; [key: string]: unknown } => b !== undefined);
  const remaining = bookmarks.filter((b) => !idSet.has(b.id));
  return [...reordered, ...remaining];
}

export function registerReorderCommand(program: Command): void {
  program
    .command("reorder <ids...>")
    .description(
      "Reorder bookmarks by placing the given IDs first (space-separated)"
    )
    .option("-s, --store <path>", "Path to the bookmark store")
    .action(async (ids: string[], options: { store?: string }) => {
      try {
        const store = await loadStore(options.store);

        const missing = ids.filter(
          (id) => !store.bookmarks.some((b) => b.id === id)
        );
        if (missing.length > 0) {
          console.error(`Bookmark(s) not found: ${missing.join(", ")}`);
          process.exit(1);
        }

        store.bookmarks = reorderBookmarks(store.bookmarks, ids);
        await saveStore(store, options.store);

        console.log(`Reordered ${ids.length} bookmark(s) to the top.`);
        ids.forEach((id) => {
          const bm = store.bookmarks.find((b) => b.id === id);
          if (bm) console.log(`  [${bm.id}] ${bm.url}`);
        });
      } catch (err) {
        console.error("Failed to reorder bookmarks:", (err as Error).message);
        process.exit(1);
      }
    });
}
