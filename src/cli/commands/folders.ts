import { Command } from "commander";
import { loadStore } from "../../store/bookmarkStore";
import { Bookmark } from "../../store/bookmarkStore";

function getFolderMap(bookmarks: Bookmark[]): Map<string, Bookmark[]> {
  const map = new Map<string, Bookmark[]>();
  for (const bm of bookmarks) {
    const folderTag = (bm.tags ?? []).find((t) => t.startsWith("folder:"));
    const folder = folderTag ? folderTag.slice(7) : "(unfiled)";
    if (!map.has(folder)) map.set(folder, []);
    map.get(folder)!.push(bm);
  }
  return map;
}

export function registerFoldersCommand(program: Command): void {
  program
    .command("folders")
    .description("List all folders and the bookmarks inside them")
    .option("-s, --store <path>", "path to bookmark store")
    .option("-f, --folder <name>", "show only a specific folder")
    .action(async (opts: { store?: string; folder?: string }) => {
      try {
        const store = await loadStore(opts.store);
        const folderMap = getFolderMap(store.bookmarks);

        if (folderMap.size === 0) {
          console.log("No bookmarks found.");
          return;
        }

        const folders = opts.folder
          ? [opts.folder]
          : Array.from(folderMap.keys()).sort();

        for (const folder of folders) {
          const items = folderMap.get(folder);
          if (!items) {
            console.log(`Folder "${folder}" not found.`);
            continue;
          }
          console.log(`\n📁 ${folder} (${items.length})`);
          for (const bm of items) {
            const tags = (bm.tags ?? [])
              .filter((t) => !t.startsWith("folder:"))
              .join(", ");
            console.log(`  • ${bm.name} — ${bm.url}${tags ? `  [${tags}]` : ""}`);
          }
        }
      } catch (err) {
        console.error("Error listing folders:", (err as Error).message);
        process.exit(1);
      }
    });
}
