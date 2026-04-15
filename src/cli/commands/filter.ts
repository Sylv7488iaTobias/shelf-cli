import { Command } from "commander";
import { loadStore } from "../../store/bookmarkStore";
import { Bookmark } from "../../store/bookmarkStore";

export function filterBookmarks(
  bookmarks: Bookmark[],
  options: {
    folder?: string;
    pinned?: boolean;
    archived?: boolean;
    favorite?: boolean;
    hasNotes?: boolean;
  }
): Bookmark[] {
  return bookmarks.filter((b) => {
    if (options.folder !== undefined && b.folder !== options.folder) return false;
    if (options.pinned !== undefined && !!b.pinned !== options.pinned) return false;
    if (options.archived !== undefined && !!b.archived !== options.archived) return false;
    if (options.favorite !== undefined && !!b.favorite !== options.favorite) return false;
    if (options.hasNotes && !b.notes) return false;
    return true;
  });
}

export function registerFilterCommand(program: Command): void {
  program
    .command("filter")
    .description("Filter bookmarks by metadata attributes")
    .option("--folder <folder>", "Filter by folder")
    .option("--pinned", "Show only pinned bookmarks")
    .option("--no-pinned", "Exclude pinned bookmarks")
    .option("--archived", "Show only archived bookmarks")
    .option("--favorite", "Show only favorite bookmarks")
    .option("--has-notes", "Show only bookmarks with notes")
    .option("--json", "Output as JSON")
    .action((opts) => {
      const store = loadStore();
      const results = filterBookmarks(store.bookmarks, {
        folder: opts.folder,
        pinned: opts.pinned === true ? true : opts.pinned === false ? false : undefined,
        archived: opts.archived,
        favorite: opts.favorite,
        hasNotes: opts.hasNotes,
      });

      if (results.length === 0) {
        console.log("No bookmarks match the given filters.");
        return;
      }

      if (opts.json) {
        console.log(JSON.stringify(results, null, 2));
        return;
      }

      for (const b of results) {
        const flags = [
          b.pinned ? "📌" : "",
          b.archived ? "📦" : "",
          b.favorite ? "⭐" : "",
          b.notes ? "📝" : "",
        ]
          .filter(Boolean)
          .join(" ");
        const folder = b.folder ? `[${b.folder}] ` : "";
        console.log(`${folder}${b.name}: ${b.url} ${flags}`.trim());
      }
    });
}
