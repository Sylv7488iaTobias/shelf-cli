import { Command } from "commander";
import { loadStore } from "../../store/bookmarkStore";
import { Bookmark } from "../../store/bookmarkStore";

function pickRandom<T>(items: T[]): T | undefined {
  if (items.length === 0) return undefined;
  return items[Math.floor(Math.random() * items.length)];
}

function formatBookmark(b: Bookmark): string {
  const tags = b.tags && b.tags.length > 0 ? `  tags: ${b.tags.join(", ")}` : "";
  const folder = b.folder ? `  folder: ${b.folder}` : "";
  const notes = b.notes ? `  notes: ${b.notes}` : "";
  const lines = [`📌 ${b.name}`, `   ${b.url}`];
  if (tags) lines.push(tags);
  if (folder) lines.push(folder);
  if (notes) lines.push(notes);
  return lines.join("\n");
}

export function registerRandomCommand(program: Command): void {
  program
    .command("random")
    .description("Show a random bookmark, optionally filtered by tag or folder")
    .option("-t, --tag <tag>", "Filter by tag before picking")
    .option("-f, --folder <folder>", "Filter by folder before picking")
    .option("--archived", "Include archived bookmarks", false)
    .action((options) => {
      const store = loadStore();
      let candidates = store.bookmarks;

      if (!options.archived) {
        candidates = candidates.filter((b) => !b.archived);
      }

      if (options.tag) {
        const tag = options.tag.toLowerCase();
        candidates = candidates.filter(
          (b) => b.tags && b.tags.map((t) => t.toLowerCase()).includes(tag)
        );
      }

      if (options.folder) {
        const folder = options.folder.toLowerCase();
        candidates = candidates.filter(
          (b) => b.folder && b.folder.toLowerCase() === folder
        );
      }

      if (candidates.length === 0) {
        console.log("No bookmarks found matching the given filters.");
        return;
      }

      const picked = pickRandom(candidates);
      if (picked) {
        console.log("\nRandom bookmark:\n");
        console.log(formatBookmark(picked));
        console.log();
      }
    });
}
