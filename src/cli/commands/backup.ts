import { Command } from "commander";
import * as fs from "fs";
import * as path from "path";
import { getStorePath, loadStore } from "../../store/bookmarkStore";

export function createBackupFilename(): string {
  const now = new Date();
  const ts = now.toISOString().replace(/[:.]/g, "-").replace("T", "_").slice(0, 19);
  return `shelf-backup-${ts}.json`;
}

export function registerBackupCommand(program: Command): void {
  program
    .command("backup")
    .description("Create a timestamped backup of your bookmark store")
    .option("-o, --output <dir>", "Directory to write backup file", ".")
    .option("--list", "List existing backups in the output directory")
    .action(async (opts) => {
      const outputDir = path.resolve(opts.output);

      if (opts.list) {
        if (!fs.existsSync(outputDir)) {
          console.log("Output directory does not exist.");
          return;
        }
        const files = fs
          .readdirSync(outputDir)
          .filter((f) => f.startsWith("shelf-backup-") && f.endsWith(".json"))
          .sort()
          .reverse();
        if (files.length === 0) {
          console.log("No backups found.");
        } else {
          console.log(`Found ${files.length} backup(s) in ${outputDir}:`);
          files.forEach((f) => console.log(`  ${f}`));
        }
        return;
      }

      const storePath = getStorePath();
      const store = loadStore(storePath);

      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const filename = createBackupFilename();
      const dest = path.join(outputDir, filename);
      fs.writeFileSync(dest, JSON.stringify(store, null, 2), "utf-8");
      console.log(`Backup created: ${dest} (${store.bookmarks.length} bookmarks)`);
    });
}
