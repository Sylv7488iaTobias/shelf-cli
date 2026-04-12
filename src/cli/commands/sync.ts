import { Command } from "commander";
import { syncBookmarks, ensureStoreIsRepo } from "../../sync/index";
import { getStorePath } from "../../store/bookmarkStore";

export function registerSyncCommand(program: Command): void {
  program
    .command("sync")
    .description("Sync bookmarks with remote git repository")
    .option("-r, --remote <url>", "Remote repository URL to set up sync")
    .option("--init", "Initialize the bookmark store as a git repository")
    .option("--push-only", "Only push local changes, skip pulling")
    .action(async (options) => {
      const storePath = getStorePath();

      try {
        if (options.init) {
          console.log("Initializing bookmark store as git repository...");
          await ensureStoreIsRepo(storePath, options.remote);
          console.log("✓ Git repository initialized.");
          if (options.remote) {
            console.log(`✓ Remote set to: ${options.remote}`);
          }
          return;
        }

        console.log("Syncing bookmarks...");

        const result = await syncBookmarks(storePath, {
          pushOnly: options.pushOnly ?? false,
        });

        if (result.pulled) {
          console.log("✓ Pulled latest changes from remote.");
        }

        if (result.pushed) {
          console.log("✓ Pushed local changes to remote.");
        }

        if (!result.pulled && !result.pushed) {
          console.log("✓ Already up to date.");
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(`Sync failed: ${message}`);
        process.exit(1);
      }
    });
}
