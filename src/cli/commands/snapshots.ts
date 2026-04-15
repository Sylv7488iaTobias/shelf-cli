import { Command } from "commander";
import * as fs from "fs";
import * as path from "path";

interface SnapshotMeta {
  file: string;
  createdAt: string;
  total: number;
}

export function listSnapshots(dir: string): SnapshotMeta[] {
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));
  const metas: SnapshotMeta[] = [];
  for (const file of files) {
    try {
      const raw = JSON.parse(fs.readFileSync(path.join(dir, file), "utf-8"));
      metas.push({ file, createdAt: raw.createdAt ?? "unknown", total: raw.total ?? 0 });
    } catch {
      // skip malformed files
    }
  }
  return metas.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function registerSnapshotsCommand(program: Command): void {
  program
    .command("snapshots")
    .description("List all saved snapshots")
    .option("-d, --dir <path>", "Directory containing snapshots", process.cwd())
    .option("--json", "Output as JSON")
    .action((opts) => {
      const metas = listSnapshots(opts.dir);
      if (metas.length === 0) {
        console.log("No snapshots found.");
        return;
      }
      if (opts.json) {
        console.log(JSON.stringify(metas, null, 2));
        return;
      }
      console.log(`Found ${metas.length} snapshot(s):\n`);
      for (const m of metas) {
        console.log(`  ${m.file}  |  ${m.createdAt}  |  ${m.total} bookmarks`);
      }
    });
}
