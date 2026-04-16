import { Command } from "commander";
import { loadStore, saveStore } from "../../store/bookmarkStore";
import { Bookmark } from "../../store/bookmarkStore";

export function registerHighlightCommand(program: Command): void {
  program
    .command("highlight <name>")
    .description("Mark a bookmark as highlighted (or remove highlight with --off)")
    .option("--off", "Remove highlight from the bookmark")
    .option("--store <path>", "Path to the bookmark store")
    .action(async (name: string, options: { off?: boolean; store?: string }) => {
      const store = await loadStore(options.store);
      const bookmark = store.bookmarks.find((b: Bookmark) => b.name === name);

      if (!bookmark) {
        console.error(`Bookmark "${name}" not found.`);
        process.exit(1);
      }

      if (options.off) {
        delete bookmark.highlighted;
        console.log(`Highlight removed from "${name}".`);
      } else {
        bookmark.highlighted = true;
        console.log(`Bookmark "${name}" is now highlighted.`);
      }

      await saveStore(store, options.store);
    });

  program
    .command("highlights")
    .description("List all highlighted bookmarks")
    .option("--store <path>", "Path to the bookmark store")
    .action(async (options: { store?: string }) => {
      const store = await loadStore(options.store);
      const highlighted = store.bookmarks.filter(
        (b: Bookmark) => b.highlighted === true
      );

      if (highlighted.length === 0) {
        console.log("No highlighted bookmarks.");
        return;
      }

      console.log(`Highlighted bookmarks (${highlighted.length}):\n`);
      for (const b of highlighted) {
        const tags = b.tags?.length ? `  [${b.tags.join(", ")}]` : "";
        console.log(`  ★ ${b.name}${tags}`);
        console.log(`    ${b.url}`);
      }
    });
}
