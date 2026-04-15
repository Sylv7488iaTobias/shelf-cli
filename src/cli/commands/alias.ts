import { Command } from "commander";
import { loadStore, saveStore } from "../../store/bookmarkStore";

export function registerAliasCommand(program: Command): void {
  program
    .command("alias")
    .description("Manage short aliases for bookmarks")
    .argument("<subcommand>", "set | get | remove | list")
    .argument("[alias]", "alias name")
    .argument("[id]", "bookmark id to associate with the alias")
    .option("-s, --store <path>", "path to bookmark store")
    .action(async (subcommand: string, alias: string | undefined, id: string | undefined, opts) => {
      const store = await loadStore(opts.store);

      if (!store.aliases) {
        store.aliases = {};
      }

      switch (subcommand) {
        case "set": {
          if (!alias || !id) {
            console.error("Usage: alias set <alias> <id>");
            process.exit(1);
          }
          const bookmark = store.bookmarks.find((b) => b.id === id);
          if (!bookmark) {
            console.error(`No bookmark found with id: ${id}`);
            process.exit(1);
          }
          store.aliases[alias] = id;
          await saveStore(opts.store, store);
          console.log(`Alias "${alias}" -> ${id} (${bookmark.url})`);
          break;
        }
        case "get": {
          if (!alias) {
            console.error("Usage: alias get <alias>");
            process.exit(1);
          }
          const targetId = store.aliases[alias];
          if (!targetId) {
            console.error(`No alias found: ${alias}`);
            process.exit(1);
          }
          const bookmark = store.bookmarks.find((b) => b.id === targetId);
          if (!bookmark) {
            console.error(`Alias "${alias}" points to missing bookmark: ${targetId}`);
            process.exit(1);
          }
          console.log(`${alias} -> ${bookmark.url}`);
          break;
        }
        case "remove": {
          if (!alias) {
            console.error("Usage: alias remove <alias>");
            process.exit(1);
          }
          if (!store.aliases[alias]) {
            console.error(`No alias found: ${alias}`);
            process.exit(1);
          }
          delete store.aliases[alias];
          await saveStore(opts.store, store);
          console.log(`Removed alias "${alias}"`);
          break;
        }
        case "list": {
          const entries = Object.entries(store.aliases);
          if (entries.length === 0) {
            console.log("No aliases defined.");
          } else {
            for (const [a, bid] of entries) {
              const bm = store.bookmarks.find((b) => b.id === bid);
              const label = bm ? bm.url : `(missing: ${bid})`;
              console.log(`${a.padEnd(20)} -> ${label}`);
            }
          }
          break;
        }
        default:
          console.error(`Unknown subcommand: ${subcommand}`);
          process.exit(1);
      }
    });
}
