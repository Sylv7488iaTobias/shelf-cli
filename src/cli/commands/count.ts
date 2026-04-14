import { Command } from "commander";
import { loadStore } from "../../store/bookmarkStore";

export function registerCountCommand(program: Command): void {
  program
    .command("count")
    .description("Count bookmarks, optionally filtered by folder or tag")
    .option("-f, --folder <folder>", "Filter by folder")
    .option("-t, --tag <tag>", "Filter by tag")
    .option("-a, --archived", "Include only archived bookmarks")
    .option("--pinned", "Include only pinned bookmarks")
    .action((options) => {
      const store = loadStore();
      let bookmarks = store.bookmarks;

      if (options.folder) {
        bookmarks = bookmarks.filter(
          (b) => b.folder?.toLowerCase() === options.folder.toLowerCase()
        );
      }

      if (options.tag) {
        bookmarks = bookmarks.filter((b) =>
          b.tags?.map((t) => t.toLowerCase()).includes(options.tag.toLowerCase())
        );
      }

      if (options.archived) {
        bookmarks = bookmarks.filter((b) => b.archived === true);
      }

      if (options.pinned) {
        bookmarks = bookmarks.filter((b) => b.pinned === true);
      }

      const total = bookmarks.length;
      const parts: string[] = [];

      if (options.folder) parts.push(`folder "${options.folder}"`);
      if (options.tag) parts.push(`tag "${options.tag}"`);
      if (options.archived) parts.push("archived");
      if (options.pinned) parts.push("pinned");

      const label = parts.length > 0 ? ` (${parts.join(", ")})` : "";
      console.log(`${total} bookmark${total !== 1 ? "s" : ""}${label}`);
    });
}
