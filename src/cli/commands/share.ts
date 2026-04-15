import { Command } from "commander";
import { loadStore } from "../../store/bookmarkStore";
import { Bookmark } from "../../store/bookmarkStore";

export function formatAsMarkdownLink(bookmark: Bookmark): string {
  const tags = bookmark.tags && bookmark.tags.length > 0
    ? ` (${bookmark.tags.join(", ")})`
    : "";
  return `[${bookmark.name}](${bookmark.url})${tags}`;
}

export function formatAsPlainLink(bookmark: Bookmark): string {
  return `${bookmark.name}: ${bookmark.url}`;
}

export function formatAsJSON(bookmark: Bookmark): string {
  return JSON.stringify({ name: bookmark.name, url: bookmark.url, tags: bookmark.tags ?? [] }, null, 2);
}

export function registerShareCommand(program: Command): void {
  program
    .command("share <name>")
    .description("Share a bookmark in a shareable format")
    .option("-f, --format <format>", "Output format: markdown, plain, json", "plain")
    .option("-s, --store <path>", "Path to bookmark store")
    .action((name: string, options: { format: string; store?: string }) => {
      const store = loadStore(options.store);
      const bookmark = store.bookmarks.find(
        (b) => b.name.toLowerCase() === name.toLowerCase()
      );

      if (!bookmark) {
        console.error(`Bookmark "${name}" not found.`);
        process.exit(1);
      }

      const format = options.format.toLowerCase();

      switch (format) {
        case "markdown":
          console.log(formatAsMarkdownLink(bookmark));
          break;
        case "json":
          console.log(formatAsJSON(bookmark));
          break;
        case "plain":
        default:
          console.log(formatAsPlainLink(bookmark));
          break;
      }
    });
}
