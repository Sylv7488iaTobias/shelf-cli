import { Command } from "commander";
import { loadStore, saveStore } from "../../store/bookmarkStore";
import { Bookmark } from "../../store/bookmarkStore";

export function isDueDate(value: string): boolean {
  const date = new Date(value);
  return !isNaN(date.getTime());
}

export function formatDueBookmark(b: Bookmark): string {
  const due = b.due ? new Date(b.due).toLocaleDateString() : "(none)";
  const overdue = b.due && new Date(b.due) < new Date() ? " ⚠ OVERDUE" : "";
  return `[${b.id}] ${b.title} <${b.url}>  due: ${due}${overdue}`;
}

export function registerDueCommand(program: Command): void {
  const due = program
    .command("due")
    .description("Manage due dates on bookmarks");

  due
    .command("set <id> <date>")
    .description("Set a due date on a bookmark (YYYY-MM-DD)")
    .option("-s, --store <path>", "Path to bookmark store")
    .action(async (id: string, date: string, opts) => {
      if (!isDueDate(date)) {
        console.error(`Invalid date: ${date}`);
        process.exit(1);
      }
      const store = await loadStore(opts.store);
      const bookmark = store.bookmarks.find((b) => b.id === id);
      if (!bookmark) {
        console.error(`Bookmark not found: ${id}`);
        process.exit(1);
      }
      bookmark.due = new Date(date).toISOString();
      await saveStore(store, opts.store);
      console.log(`Due date set to ${date} on "${bookmark.title}"`);
    });

  due
    .command("clear <id>")
    .description("Clear the due date from a bookmark")
    .option("-s, --store <path>", "Path to bookmark store")
    .action(async (id: string, opts) => {
      const store = await loadStore(opts.store);
      const bookmark = store.bookmarks.find((b) => b.id === id);
      if (!bookmark) {
        console.error(`Bookmark not found: ${id}`);
        process.exit(1);
      }
      delete bookmark.due;
      await saveStore(store, opts.store);
      console.log(`Due date cleared from "${bookmark.title}"`);
    });

  due
    .command("list")
    .description("List bookmarks with due dates")
    .option("-s, --store <path>", "Path to bookmark store")
    .option("--overdue", "Show only overdue bookmarks")
    .action(async (opts) => {
      const store = await loadStore(opts.store);
      let results = store.bookmarks.filter((b) => b.due);
      if (opts.overdue) {
        results = results.filter((b) => b.due && new Date(b.due) < new Date());
      }
      if (results.length === 0) {
        console.log(opts.overdue ? "No overdue bookmarks." : "No bookmarks with due dates.");
        return;
      }
      results
        .sort((a, b) => new Date(a.due!).getTime() - new Date(b.due!).getTime())
        .forEach((b) => console.log(formatDueBookmark(b)));
    });
}
