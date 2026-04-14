import { Command } from "commander";
import { loadStore } from "../../store/bookmarkStore";
import { Bookmark } from "../../store/bookmarkStore";

function formatBookmark(b: Bookmark, index: number): string {
  const tags = b.tags && b.tags.length > 0 ? ` [${b.tags.join(", ")}]` : "";
  const folder = b.folder ? ` (${b.folder})` : "";
  const pinned = b.pinned ? " 📌" : "";
  return `${index + 1}. ${b.name}${pinned}\n   ${b.url}${folder}${tags}`;
}

export function registerRecentCommand(program: Command): void {
  program
    .command("recent")
    .description("Show recently added bookmarks")
    .option("-n, --count <number>", "Number of recent bookmarks to show", "10")
    .option("-f, --folder <folder>", "Filter by folder")
    .option("--store <path>", "Path to bookmark store")
    .action((options) => {
      const store = loadStore(options.store);
      const count = parseInt(options.count, 10);

      if (isNaN(count) || count <= 0) {
        console.error("Error: count must be a positive integer");
        process.exit(1);
      }

      let bookmarks: Bookmark[] = [...store.bookmarks];

      if (options.folder) {
        bookmarks = bookmarks.filter(
          (b) => b.folder?.toLowerCase() === options.folder.toLowerCase()
        );
      }

      const sorted = bookmarks
        .filter((b) => b.createdAt)
        .sort(
          (a, b) =>
            new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
        );

      const recent = sorted.slice(0, count);

      if (recent.length === 0) {
        console.log("No bookmarks found.");
        return;
      }

      console.log(`\nRecently added bookmarks (${recent.length}):`);
      console.log("─".repeat(40));
      recent.forEach((b, i) => console.log(formatBookmark(b, i)));
    });
}
