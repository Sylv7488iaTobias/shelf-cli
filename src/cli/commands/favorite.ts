import { Command } from "commander";
import { loadStore, saveStore, getStorePath } from "../../store/bookmarkStore";

export function registerFavoriteCommand(program: Command): void {
  program
    .command("favorite <name>")
    .alias("fav")
    .description("Toggle the favorite status of a bookmark")
    .option("-s, --store <path>", "Path to bookmark store")
    .option("--list", "List all favorited bookmarks")
    .action(async (name: string, options: { store?: string; list?: boolean }) => {
      const storePath = getStorePath(options.store);
      const store = loadStore(storePath);

      if (options.list) {
        const favorites = store.bookmarks.filter((b) => b.favorite);
        if (favorites.length === 0) {
          console.log("No favorited bookmarks.");
          return;
        }
        console.log("Favorites:");
        favorites.forEach((b) => {
          const tags = b.tags && b.tags.length > 0 ? ` [${b.tags.join(", ")}]` : "";
          console.log(`  ★ ${b.name} — ${b.url}${tags}`);
        });
        return;
      }

      const bookmark = store.bookmarks.find(
        (b) => b.name.toLowerCase() === name.toLowerCase()
      );

      if (!bookmark) {
        console.error(`Bookmark "${name}" not found.`);
        process.exit(1);
      }

      bookmark.favorite = !bookmark.favorite;
      saveStore(storePath, store);

      if (bookmark.favorite) {
        console.log(`★ "${bookmark.name}" marked as favorite.`);
      } else {
        console.log(`☆ "${bookmark.name}" removed from favorites.`);
      }
    });
}
