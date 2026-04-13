import { Command } from "commander";
import { loadStore, saveStore } from "../../store/bookmarkStore";

export function registerTagCommand(program: Command): void {
  program
    .command("tag <id> [tags...]")
    .description("Add or remove tags from a bookmark")
    .option("-r, --remove", "Remove the specified tags instead of adding them")
    .action(async (id: string, tags: string[], options: { remove?: boolean }) => {
      try {
        const store = await loadStore();
        const bookmark = store.bookmarks.find((b) => b.id === id);

        if (!bookmark) {
          console.error(`No bookmark found with id: ${id}`);
          process.exit(1);
        }

        if (!tags || tags.length === 0) {
          const currentTags = bookmark.tags ?? [];
          if (currentTags.length === 0) {
            console.log(`Bookmark "${bookmark.title}" has no tags.`);
          } else {
            console.log(`Tags for "${bookmark.title}": ${currentTags.join(", ")}`);
          }
          return;
        }

        if (options.remove) {
          const before = bookmark.tags ?? [];
          bookmark.tags = before.filter((t) => !tags.includes(t));
          const removed = before.filter((t) => tags.includes(t));
          if (removed.length === 0) {
            console.log(`No matching tags found to remove.`);
          } else {
            console.log(`Removed tags [${removed.join(", ")}] from "${bookmark.title}".`);
          }
        } else {
          const existing = new Set(bookmark.tags ?? []);
          const added: string[] = [];
          for (const tag of tags) {
            if (!existing.has(tag)) {
              existing.add(tag);
              added.push(tag);
            }
          }
          bookmark.tags = Array.from(existing);
          if (added.length === 0) {
            console.log(`All specified tags already exist on "${bookmark.title}".`);
          } else {
            console.log(`Added tags [${added.join(", ")}] to "${bookmark.title}".`);
          }
        }

        await saveStore(store);
      } catch (err) {
        console.error("Failed to update tags:", (err as Error).message);
        process.exit(1);
      }
    });
}
