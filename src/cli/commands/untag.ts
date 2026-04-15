import { Command } from "commander";
import { loadStore, saveStore, getStorePath } from "../../store/bookmarkStore";

export function registerUntagCommand(program: Command): void {
  program
    .command("untag <name> <tags...>")
    .description("Remove one or more tags from a bookmark")
    .option("-s, --store <path>", "path to bookmark store")
    .action(async (name: string, tags: string[], opts: { store?: string }) => {
      const storePath = opts.store ?? getStorePath();
      const store = await loadStore(storePath);

      const bookmark = store.bookmarks.find((b) => b.name === name);
      if (!bookmark) {
        console.error(`Bookmark "${name}" not found.`);
        process.exit(1);
      }

      const before = bookmark.tags?.length ?? 0;
      const tagsToRemove = new Set(tags.map((t) => t.toLowerCase()));
      bookmark.tags = (bookmark.tags ?? []).filter(
        (t) => !tagsToRemove.has(t.toLowerCase())
      );
      const removed = before - (bookmark.tags?.length ?? 0);

      if (removed === 0) {
        console.log(`No matching tags found on "${name}".`);
        return;
      }

      await saveStore(storePath, store);
      console.log(
        `Removed ${removed} tag(s) from "${name}". Remaining tags: ${
          bookmark.tags.length > 0 ? bookmark.tags.join(", ") : "(none)"
        }`
      );
    });
}
