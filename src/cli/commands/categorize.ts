import { Command } from "commander";
import { loadStore, saveStore } from "../../store/bookmarkStore";
import { Bookmark } from "../../store/bookmarkStore";

export function inferCategory(bookmark: Bookmark): string {
  const url = bookmark.url.toLowerCase();
  const title = (bookmark.title || "").toLowerCase();

  if (/github\.com|gitlab\.com|bitbucket\.org/.test(url)) return "code";
  if (/youtube\.com|vimeo\.com|twitch\.tv/.test(url)) return "video";
  if (/medium\.com|dev\.to|substack\.com|blog/.test(url)) return "blog";
  if (/twitter\.com|x\.com|linkedin\.com|reddit\.com/.test(url)) return "social";
  if (/docs\.|documentation|readme|wiki/.test(url + title)) return "docs";
  if (/arxiv\.org|scholar\.google|researchgate/.test(url)) return "research";
  if (/amazon\.com|shop|store|buy|product/.test(url + title)) return "shopping";
  if (/news|hn\.algolia|hackernews|techcrunch|wired/.test(url + title)) return "news";
  if (/stackoverflow\.com|stackexchange\.com/.test(url)) return "qa";
  return "misc";
}

export function registerCategorizeCommand(program: Command): void {
  program
    .command("categorize")
    .description("Auto-assign a category to bookmarks based on URL patterns")
    .option("-s, --store <path>", "path to bookmark store")
    .option("--dry-run", "preview changes without saving")
    .option("--overwrite", "overwrite existing categories")
    .action(async (opts) => {
      const store = await loadStore(opts.store);
      let changed = 0;

      const updated = store.bookmarks.map((b: Bookmark) => {
        if (b.category && !opts.overwrite) return b;
        const category = inferCategory(b);
        if (category !== b.category) {
          changed++;
          if (!opts.dryRun) {
            return { ...b, category };
          } else {
            console.log(`  [${b.id}] "${b.title || b.url}" → ${category}`);
          }
        }
        return b;
      });

      if (opts.dryRun) {
        console.log(`\n${changed} bookmark(s) would be updated.`);
        return;
      }

      await saveStore(opts.store, { ...store, bookmarks: updated });
      console.log(`Categorized ${changed} bookmark(s).`);
    });
}
