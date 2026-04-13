import { Command } from "commander";
import * as fs from "fs";
import * as path from "path";
import { getStorePath, saveStore } from "../../store/bookmarkStore";
import { BookmarkStore } from "../../store/bookmarkStore";

export function validateBackupFile(filePath: string): BookmarkStore {
  const raw = fs.readFileSync(filePath, "utf-8");
  const parsed = JSON.parse(raw);
  if (!parsed || !Array.isArray(parsed.bookmarks)) {
    throw new Error("Invalid backup file: missing bookmarks array");
  }
  return parsed as BookmarkStore;
}

export function registerRestoreCommand(program: Command): void {
  program
    .command("restore <file>")
    .description("Restore bookmarks from a backup file")
    .option("--dry-run", "Preview what would be restored without writing changes")
    .option("--merge", "Merge backup bookmarks with existing ones (skip duplicates by URL)")
    .action(async (file: string, opts) => {
      const filePath = path.resolve(file);
      if (!fs.existsSync(filePath)) {
        console.error(`Backup file not found: ${filePath}`);
        process.exitCode = 1;
        return;
      }

      let backup: BookmarkStore;
      try {
        backup = validateBackupFile(filePath);
      } catch (err: any) {
        console.error(`Failed to parse backup: ${err.message}`);
        process.exitCode = 1;
        return;
      }

      const storePath = getStorePath();

      if (opts.merge) {
        const { loadStore } = await import("../../store/bookmarkStore");
        const current = loadStore(storePath);
        const existingUrls = new Set(current.bookmarks.map((b) => b.url));
        const toAdd = backup.bookmarks.filter((b) => !existingUrls.has(b.url));
        if (opts.dryRun) {
          console.log(`Dry run: would merge ${toAdd.length} new bookmark(s).`);
          return;
        }
        current.bookmarks.push(...toAdd);
        saveStore(storePath, current);
        console.log(`Merged ${toAdd.length} bookmark(s) from backup.`);
      } else {
        if (opts.dryRun) {
          console.log(`Dry run: would restore ${backup.bookmarks.length} bookmark(s).`);
          return;
        }
        saveStore(storePath, backup);
        console.log(`Restored ${backup.bookmarks.length} bookmark(s) from ${path.basename(filePath)}.`);
      }
    });
}
