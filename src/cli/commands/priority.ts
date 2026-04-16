import { Command } from "commander";
import { loadStore, saveStore, getStorePath } from "../../store/bookmarkStore";

const VALID_PRIORITIES = ["low", "medium", "high"] as const;
type Priority = typeof VALID_PRIORITIES[number];

function isPriority(value: string): value is Priority {
  return VALID_PRIORITIES.includes(value as Priority);
}

export function registerPriorityCommand(program: Command): void {
  program
    .command("priority <name> <level>")
    .description("Set the priority of a bookmark (low, medium, high)")
    .option("-s, --store <path>", "path to bookmark store")
    .action(async (name: string, level: string, opts: { store?: string }) => {
      const storePath = opts.store ?? getStorePath();
      const store = await loadStore(storePath);

      if (!isPriority(level)) {
        console.error(
          `Invalid priority "${level}". Must be one of: ${VALID_PRIORITIES.join(", ")}`
        );
        process.exit(1);
      }

      const bookmark = store.bookmarks.find((b) => b.name === name);

      if (!bookmark) {
        console.error(`Bookmark "${name}" not found.`);
        process.exit(1);
      }

      const previous = (bookmark as any).priority ?? "none";
      (bookmark as any).priority = level;

      await saveStore(storePath, store);
      console.log(
        `Priority for "${name}" updated: ${previous} → ${level}`
      );
    });

  program
    .command("priority:clear <name>")
    .description("Clear the priority from a bookmark")
    .option("-s, --store <path>", "path to bookmark store")
    .action(async (name: string, opts: { store?: string }) => {
      const storePath = opts.store ?? getStorePath();
      const store = await loadStore(storePath);

      const bookmark = store.bookmarks.find((b) => b.name === name);

      if (!bookmark) {
        console.error(`Bookmark "${name}" not found.`);
        process.exit(1);
      }

      delete (bookmark as any).priority;
      await saveStore(storePath, store);
      console.log(`Priority cleared for "${name}".`);
    });
}
