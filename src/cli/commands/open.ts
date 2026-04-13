import { Command } from "commander";
import open from "open";
import { loadStore, getStorePath } from "../../store/bookmarkStore";
import { searchBookmarks } from "../../search/searchBookmarks";

export function registerOpenCommand(program: Command): void {
  program
    .command("open")
    .description("Open a bookmark URL in the default browser")
    .argument("<query>", "Search query or exact bookmark ID to open")
    .option("-f, --first", "Automatically open the first result without prompting")
    .action(async (query: string, options: { first?: boolean }) => {
      try {
        const storePath = getStorePath();
        const store = loadStore(storePath);

        const results = searchBookmarks(store.bookmarks, query);

        if (results.length === 0) {
          console.error(`No bookmarks found matching: ${query}`);
          process.exit(1);
        }

        let target = results[0];

        if (results.length > 1 && !options.first) {
          console.log("Multiple matches found:");
          results.forEach((b, i) => {
            console.log(`  [${i + 1}] ${b.title} — ${b.url}`);
          });
          console.log(`\nOpening first result: ${target.title}`);
        }

        console.log(`Opening: ${target.url}`);
        await open(target.url);
      } catch (err) {
        console.error("Failed to open bookmark:", (err as Error).message);
        process.exit(1);
      }
    });
}
