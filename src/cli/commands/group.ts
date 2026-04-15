import { Command } from "commander";
import { loadStore, saveStore } from "../../store/bookmarkStore";
import { Bookmark } from "../../store/bookmarkStore";

export function getGroupMap(bookmarks: Bookmark[]): Record<string, Bookmark[]> {
  const map: Record<string, Bookmark[]> = {};
  for (const bm of bookmarks) {
    const group = bm.folder ?? "(none)";
    if (!map[group]) map[group] = [];
    map[group].push(bm);
  }
  return map;
}

export function registerGroupCommand(program: Command): void {
  const group = program
    .command("group")
    .description("Group bookmarks by folder and display counts or listings");

  group
    .command("list")
    .description("List all groups (folders) with bookmark counts")
    .option("-s, --store <path>", "Path to bookmark store")
    .action((opts) => {
      const store = loadStore(opts.store);
      const map = getGroupMap(store.bookmarks);
      const entries = Object.entries(map).sort((a, b) => a[0].localeCompare(b[0]));
      if (entries.length === 0) {
        console.log("No bookmarks found.");
        return;
      }
      for (const [folder, bms] of entries) {
        console.log(`${folder} (${bms.length})`);
      }
    });

  group
    .command("show <folder>")
    .description("Show all bookmarks in a specific group/folder")
    .option("-s, --store <path>", "Path to bookmark store")
    .action((folder, opts) => {
      const store = loadStore(opts.store);
      const map = getGroupMap(store.bookmarks);
      const key = folder === "none" ? "(none)" : folder;
      const bms = map[key];
      if (!bms || bms.length === 0) {
        console.log(`No bookmarks found in group "${folder}".`);
        return;
      }
      for (const bm of bms) {
        console.log(`[${bm.id}] ${bm.name} — ${bm.url}`);
      }
    });

  group
    .command("move <folder> <newFolder>")
    .description("Rename a group (move all bookmarks from one folder to another)")
    .option("-s, --store <path>", "Path to bookmark store")
    .action((folder, newFolder, opts) => {
      const store = loadStore(opts.store);
      let count = 0;
      for (const bm of store.bookmarks) {
        if ((bm.folder ?? "(none)") === folder) {
          bm.folder = newFolder;
          count++;
        }
      }
      if (count === 0) {
        console.log(`No bookmarks found in group "${folder}".`);
        return;
      }
      saveStore(store, opts.store);
      console.log(`Moved ${count} bookmark(s) from "${folder}" to "${newFolder}".`);
    });
}
