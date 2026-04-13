import { Command } from "commander";
import * as clipboardy from "clipboardy";
import { loadStore } from "../../store/bookmarkStore";

export function registerCopyCommand(program: Command): void {
  program
    .command("copy <name>")
    .description("Copy a bookmark URL to the clipboard")
    .option("-s, --store <path>", "Path to the bookmark store")
    .action(async (name: string, options: { store?: string }) => {
      try {
        const store = await loadStore(options.store);
        const bookmark = store.bookmarks.find(
          (b) => b.name.toLowerCase() === name.toLowerCase()
        );

        if (!bookmark) {
          console.error(`Bookmark "${name}" not found.`);
          const similar = store.bookmarks
            .filter((b) => b.name.toLowerCase().includes(name.toLowerCase()))
            .map((b) => b.name);
          if (similar.length > 0) {
            console.error(`Did you mean: ${similar.join(", ")}?`);
          }
          process.exit(1);
        }

        await clipboardy.write(bookmark.url);
        console.log(`Copied to clipboard: ${bookmark.url}`);
      } catch (err: any) {
        console.error(`Error copying bookmark: ${err.message}`);
        process.exit(1);
      }
    });
}
