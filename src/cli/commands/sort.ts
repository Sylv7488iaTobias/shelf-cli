import { Command } from "commander";
import { loadStore, saveStore } from "../../store/bookmarkStore";
import { Bookmark } from "../../store/bookmarkStore";

export type SortField = "title" | "url" | "createdAt" | "folder";
export type SortOrder = "asc" | "desc";

export function sortBookmarks(
  bookmarks: Bookmark[],
  field: SortField,
  order: SortOrder = "asc"
): Bookmark[] {
  const sorted = [...bookmarks].sort((a, b) => {
    const aVal = (a[field] ?? "").toString().toLowerCase();
    const bVal = (b[field] ?? "").toString().toLowerCase();
    if (aVal < bVal) return -1;
    if (aVal > bVal) return 1;
    return 0;
  });
  return order === "desc" ? sorted.reverse() : sorted;
}

export function registerSortCommand(program: Command): void {
  program
    .command("sort")
    .description("Sort bookmarks in the store by a given field and save the order")
    .option("-f, --field <field>", "Field to sort by: title, url, createdAt, folder", "title")
    .option("-o, --order <order>", "Sort order: asc or desc", "asc")
    .option("-s, --store <path>", "Path to the bookmark store")
    .option("--dry-run", "Preview the sorted order without saving")
    .action((opts) => {
      const validFields: SortField[] = ["title", "url", "createdAt", "folder"];
      const validOrders: SortOrder[] = ["asc", "desc"];

      if (!validFields.includes(opts.field)) {
        console.error(`Invalid field "${opts.field}". Choose from: ${validFields.join(", ")}`);
        process.exit(1);
      }

      if (!validOrders.includes(opts.order)) {
        console.error(`Invalid order "${opts.order}". Choose from: asc, desc`);
        process.exit(1);
      }

      const store = loadStore(opts.store);
      const sorted = sortBookmarks(store.bookmarks, opts.field as SortField, opts.order as SortOrder);

      if (opts.dryRun) {
        console.log(`Preview (sorted by ${opts.field} ${opts.order}):\n`);
        sorted.forEach((b, i) => {
          console.log(`  ${i + 1}. [${b.title}] ${b.url}`);
        });
        return;
      }

      store.bookmarks = sorted;
      saveStore(opts.store, store);
      console.log(`Bookmarks sorted by "${opts.field}" (${opts.order}) and saved.`);
    });
}
