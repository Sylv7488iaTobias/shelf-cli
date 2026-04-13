import { Command } from "commander";
import { loadStore, saveStore, getStorePath } from "../../store/bookmarkStore";

export function registerEditCommand(program: Command): void {
  program
    .command("edit <name>")
    .description("Edit an existing bookmark's URL, tags, or description")
    .option("-u, --url <url>", "New URL for the bookmark")
    .option("-t, --tags <tags>", "Comma-separated list of tags (replaces existing)")
    .option("-d, --desc <desc>", "New description for the bookmark")
    .action(async (name: string, options: { url?: string; tags?: string; desc?: string }) => {
      const storePath = getStorePath();
      const store = await loadStore(storePath);

      const bookmark = store.bookmarks.find((b) => b.name === name);
      if (!bookmark) {
        console.error(`Bookmark "${name}" not found.`);
        process.exit(1);
      }

      let changed = false;

      if (options.url) {
        bookmark.url = options.url;
        changed = true;
      }

      if (options.tags !== undefined) {
        bookmark.tags = options.tags
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t.length > 0);
        changed = true;
      }

      if (options.desc !== undefined) {
        bookmark.description = options.desc;
        changed = true;
      }

      if (!changed) {
        console.log("No changes provided. Use --url, --tags, or --desc to update the bookmark.");
        return;
      }

      bookmark.updatedAt = new Date().toISOString();
      await saveStore(storePath, store);
      console.log(`Bookmark "${name}" updated successfully.`);
    });
}
