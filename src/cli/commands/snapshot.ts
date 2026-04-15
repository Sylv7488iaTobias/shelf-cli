import { Command } from "commander";
import * as fs from "fs";
import * as path from "path";
import { loadStore } from "../../store/bookmarkStore";

export function createSnapshotFilename(): string {
  const now = new Date();
  const ts = now.toISOString().replace(/[:.]/g, "-").replace("T", "_").slice(0, 19);
  return `snapshot-${ts}.json`;
}

export function registerSnapshotCommand(program: Command): void {
  program
    .command("snapshot")
    .description("Save a named snapshot of your current bookmarks")
    .option("-o, --output <dir>", "Directory to save the snapshot", process.cwd())
    .option("-n, --name <name>", "Custom snapshot name (without extension)")
    .option("--store <path>", "Path to bookmark store")
    .action((opts) => {
      const storePath = opts.store;
      const store = loadStore(storePath);
      const total = store.bookmarks.length;

      const filename = opts.name
        ? `${opts.name}.json`
        : createSnapshotFilename();

      const outDir = opts.output;
      if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
      }

      const outPath = path.join(outDir, filename);
      const snapshot = {
        createdAt: new Date().toISOString(),
        total,
        bookmarks: store.bookmarks,
      };

      fs.writeFileSync(outPath, JSON.stringify(snapshot, null, 2), "utf-8");
      console.log(`Snapshot saved: ${outPath} (${total} bookmarks)`);
    });
}
