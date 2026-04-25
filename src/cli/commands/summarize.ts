import { Command } from "commander";
import { loadStore } from "../../store/bookmarkStore";
import { Bookmark } from "../../store/bookmarkStore";

function getDomainCounts(bookmarks: Bookmark[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const bm of bookmarks) {
    try {
      const domain = new URL(bm.url).hostname.replace(/^www\./, "");
      counts[domain] = (counts[domain] ?? 0) + 1;
    } catch {
      counts["(invalid)"] = (counts["(invalid)"] ?? 0) + 1;
    }
  }
  return counts;
}

function getTagCounts(bookmarks: Bookmark[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const bm of bookmarks) {
    for (const tag of bm.tags ?? []) {
      counts[tag] = (counts[tag] ?? 0) + 1;
    }
  }
  return counts;
}

export function registerSummarizeCommand(program: Command): void {
  program
    .command("summarize")
    .description("Print a high-level summary of the bookmark store")
    .option("--top <n>", "Number of top domains/tags to show", "5")
    .option("--store <path>", "Path to bookmark store")
    .action((opts) => {
      const store = loadStore(opts.store);
      const bookmarks = store.bookmarks;
      const top = parseInt(opts.top, 10);

      const total = bookmarks.length;
      const archived = bookmarks.filter((b) => b.archived).length;
      const pinned = bookmarks.filter((b) => b.pinned).length;
      const tagged = bookmarks.filter((b) => (b.tags?.length ?? 0) > 0).length;

      console.log(`📚 Total bookmarks : ${total}`);
      console.log(`📌 Pinned          : ${pinned}`);
      console.log(`🗄️  Archived        : ${archived}`);
      console.log(`🏷️  With tags        : ${tagged}`);

      const domainCounts = getDomainCounts(bookmarks);
      const topDomains = Object.entries(domainCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, top);

      if (topDomains.length > 0) {
        console.log(`\n🌐 Top ${top} domains:`);
        for (const [domain, count] of topDomains) {
          console.log(`   ${domain.padEnd(30)} ${count}`);
        }
      }

      const tagCounts = getTagCounts(bookmarks);
      const topTags = Object.entries(tagCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, top);

      if (topTags.length > 0) {
        console.log(`\n🏷️  Top ${top} tags:`);
        for (const [tag, count] of topTags) {
          console.log(`   ${tag.padEnd(30)} ${count}`);
        }
      }
    });
}
