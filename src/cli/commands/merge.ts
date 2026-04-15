import { Command } from "commander";
import * as fs from "fs";
import * as path from "path";
import { loadStore, saveStore } from "../../store/bookmarkStore";
import { Bookmark } from "../../store/bookmarkStore";

export function mergeStores(
  base: Bookmark[],
  incoming: Bookmark[]
): { merged: Bookmark[]; added: number; skipped: number } {
  const existingUrls = new Set(base.map((b) => b.url));
  const existingIds = new Set(base.map((b) => b.id));
  let added = 0;
  let skipped = 0;

  const merged = [...base];

  for (const bookmark of incoming) {
    if (existingUrls.has(bookmark.url) || existingIds.has(bookmark.id)) {
      skipped++;
      continue;
    }
    merged.push(bookmark);
    existingUrls.add(bookmark.url);
    existingIds.add(bookmark.id);
    added++;
  }

  return { merged, added, skipped };
}

export function registerMergeCommand(program: Command): void {
  program
    .command("merge <file>")
    .description("Merge bookmarks from another shelf JSON store file")
    .option("--dry-run", "Preview changes without saving", false)
    .action((file: string, options: { dryRun: boolean }) => {
      const absPath = path.resolve(file);

      if (!fs.existsSync(absPath)) {
        console.error(`File not found: ${absPath}`);
        process.exit(1);
      }

      let incoming: Bookmark[];
      try {
        const raw = fs.readFileSync(absPath, "utf-8");
        incoming = JSON.parse(raw);
        if (!Array.isArray(incoming)) throw new Error("Expected an array");
      } catch (err) {
        console.error(`Failed to parse file: ${(err as Error).message}`);
        process.exit(1);
      }

      const base = loadStore();
      const { merged, added, skipped } = mergeStores(base, incoming);

      if (options.dryRun) {
        console.log(`[dry-run] Would add ${added} bookmark(s), skip ${skipped} duplicate(s).`);
        return;
      }

      saveStore(merged);
      console.log(`Merged: ${added} added, ${skipped} skipped (duplicates by URL or ID).`);
    });
}
