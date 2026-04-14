import { Command } from "commander";
import { loadStore } from "../../store/bookmarkStore";
import { Bookmark } from "../../store/bookmarkStore";

function formatBookmark(b: Bookmark, rank: number): string {
  const tags = b.tags && b.tags.length > 0 ? ` [${b.tags.join(", ")}]` : "";
  const folder = b.folder ? ` (${b.folder})` : "";
  return `${rank}. ${b.name}${folder}${tags}\n   ${b.url}`;
}

export function registerTopCommand(program: Command): void {
  program
    .command("top")
    .description("Show the most recently added bookmarks ranked by recency")
    .option("-n, --count <number>", "Number of bookmarks to show", "10")
    .option("-f, --folder <folder>", "Filter by folder")
    .option("-t, --tag <tag>", "Filter by tag")
    .option("--store <path>", "Path to bookmark store")
    .action(async (opts) => {
      const store = await loadStore(opts.store);
      const limit = parseInt(opts.count, 10);

      if (isNaN(limit) || limit <= 0) {
        console.error("Error: count must be a positive integer");
        process.exit(1);
      }

      let bookmarks = [...store.bookmarks];

      if (opts.folder) {
        bookmarks = bookmarks.filter(
          (b) => b.folder?.toLowerCase() === opts.folder.toLowerCase()
        );
      }

      if (opts.tag) {
        bookmarks = bookmarks.filter(
          (b) => b.tags?.map((t) => t.toLowerCase()).includes(opts.tag.toLowerCase())
        );
      }

      bookmarks.sort((a, b) => {
        const dateA = new Date(a.createdAt ?? 0).getTime();
        const dateB = new Date(b.createdAt ?? 0).getTime();
        return dateB - dateA;
      });

      const top = bookmarks.slice(0, limit);

      if (top.length === 0) {
        console.log("No bookmarks found.");
        return;
      }

      console.log(`Top ${top.length} bookmark(s):\n`);
      top.forEach((b, i) => console.log(formatBookmark(b, i + 1)));
    });
}
