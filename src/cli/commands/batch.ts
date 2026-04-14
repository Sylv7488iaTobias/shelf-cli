import { Command } from "commander";
import { loadStore, saveStore, addBookmark } from "../../store/bookmarkStore";
import { Bookmark } from "../../store/bookmarkStore";
import * as fs from "fs";

export interface BatchEntry {
  url: string;
  name: string;
  tags?: string[];
  folder?: string;
}

export function parseBatchFile(filePath: string): BatchEntry[] {
  const raw = fs.readFileSync(filePath, "utf-8");
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(`Invalid JSON in batch file: ${filePath}`);
  }
  if (!Array.isArray(parsed)) {
    throw new Error("Batch file must contain a JSON array of bookmark entries.");
  }
  return parsed.map((entry: unknown, i: number) => {
    if (typeof entry !== "object" || entry === null) {
      throw new Error(`Entry at index ${i} is not an object.`);
    }
    const e = entry as Record<string, unknown>;
    if (typeof e.url !== "string" || !e.url) {
      throw new Error(`Entry at index ${i} is missing a valid 'url' field.`);
    }
    if (typeof e.name !== "string" || !e.name) {
      throw new Error(`Entry at index ${i} is missing a valid 'name' field.`);
    }
    return {
      url: e.url,
      name: e.name,
      tags: Array.isArray(e.tags) ? (e.tags as string[]) : [],
      folder: typeof e.folder === "string" ? e.folder : undefined,
    };
  });
}

export function registerBatchCommand(program: Command): void {
  program
    .command("batch <file>")
    .description("Add multiple bookmarks from a JSON file")
    .option("--dry-run", "Preview what would be added without saving", false)
    .action((file: string, options: { dryRun: boolean }) => {
      let entries: BatchEntry[];
      try {
        entries = parseBatchFile(file);
      } catch (err) {
        console.error(`Error reading batch file: ${(err as Error).message}`);
        process.exit(1);
      }

      if (options.dryRun) {
        console.log(`Dry run — ${entries.length} bookmark(s) would be added:`);
        entries.forEach((e) => {
          const tags = e.tags && e.tags.length ? ` [${e.tags.join(", ")}]` : "";
          const folder = e.folder ? ` (${e.folder})` : "";
          console.log(`  • ${e.name}${folder}: ${e.url}${tags}`);
        });
        return;
      }

      const storePath = process.env.SHELF_STORE_PATH;
      const store = loadStore(storePath);
      let added = 0;

      for (const entry of entries) {
        const exists = store.bookmarks.some((b: Bookmark) => b.url === entry.url);
        if (exists) {
          console.warn(`Skipping duplicate URL: ${entry.url}`);
          continue;
        }
        addBookmark(store, entry.url, entry.name, entry.tags ?? [], entry.folder);
        added++;
      }

      saveStore(store, storePath);
      console.log(`Batch import complete: ${added} bookmark(s) added, ${entries.length - added} skipped.`);
    });
}
