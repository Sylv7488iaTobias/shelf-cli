import { Command } from "commander";
import { loadStore, saveStore, getStorePath } from "../../store/bookmarkStore";
import { Bookmark } from "../../store/bookmarkStore";

export interface DedupeResult {
  removed: Bookmark[];
  kept: Bookmark[];
}

export function findDuplicates(bookmarks: Bookmark[]): DedupeResult {
  const seen = new Map<string, Bookmark>();
  const removed: Bookmark[] = [];
  const kept: Bookmark[] = [];

  for (const bookmark of bookmarks) {
    const normalizedUrl = bookmark.url.trim().toLowerCase().replace(/\/$/, "");
    if (seen.has(normalizedUrl)) {
      removed.push(bookmark);
    } else {
      seen.set(normalizedUrl, bookmark);
      kept.push(bookmark);
    }
  }

  return { removed, kept };
}

export function registerDedupeCommand(program: Command): void {
  program
    .command("dedupe")
    .description("Remove duplicate bookmarks with the same URL")
    .option("--dry-run", "Show duplicates without removing them")
    .option("-s, --store <path>", "Path to the bookmark store")
    .action(async (options) => {
      const storePath = options.store ?? getStorePath();
      const store = await loadStore(storePath);

      const { removed, kept } = findDuplicates(store.bookmarks);

      if (removed.length === 0) {
        console.log("No duplicate bookmarks found.");
        return;
      }

      console.log(`Found ${removed.length} duplicate(s):`);
      for (const b of removed) {
        console.log(`  - [${b.name}] ${b.url}`);
      }

      if (options.dryRun) {
        console.log("Dry run: no changes saved.");
        return;
      }

      store.bookmarks = kept;
      await saveStore(storePath, store);
      console.log(`Removed ${removed.length} duplicate(s). ${kept.length} bookmark(s) remaining.`);
    });
}
