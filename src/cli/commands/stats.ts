import { Command } from "commander";
import { loadStore } from "../../store/bookmarkStore";

interface StatsOutput {
  totalBookmarks: number;
  totalTags: number;
  pinnedCount: number;
  topTags: { tag: string; count: number }[];
  recentlyAdded: { name: string; url: string; createdAt: string }[];
}

export function computeStats(storePath: string): StatsOutput {
  const store = loadStore(storePath);
  const bookmarks = store.bookmarks;

  const tagCounts: Record<string, number> = {};
  let pinnedCount = 0;

  for (const bm of bookmarks) {
    if (bm.pinned) pinnedCount++;
    for (const tag of bm.tags ?? []) {
      tagCounts[tag] = (tagCounts[tag] ?? 0) + 1;
    }
  }

  const topTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([tag, count]) => ({ tag, count }));

  const recentlyAdded = [...bookmarks]
    .filter((bm) => !!bm.createdAt)
    .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
    .slice(0, 5)
    .map((bm) => ({ name: bm.name, url: bm.url, createdAt: bm.createdAt! }));

  return {
    totalBookmarks: bookmarks.length,
    totalTags: Object.keys(tagCounts).length,
    pinnedCount,
    topTags,
    recentlyAdded,
  };
}

export function registerStatsCommand(program: Command, storePath: string): void {
  program
    .command("stats")
    .description("Show statistics about your bookmark collection")
    .action(() => {
      const stats = computeStats(storePath);

      console.log(`\n📚 Bookmark Stats`);
      console.log(`  Total bookmarks : ${stats.totalBookmarks}`);
      console.log(`  Unique tags     : ${stats.totalTags}`);
      console.log(`  Pinned          : ${stats.pinnedCount}`);

      if (stats.topTags.length > 0) {
        console.log(`\n🏷️  Top Tags:`);
        for (const { tag, count } of stats.topTags) {
          console.log(`  ${tag.padEnd(20)} ${count}`);
        }
      }

      if (stats.recentlyAdded.length > 0) {
        console.log(`\n🕒 Recently Added:`);
        for (const bm of stats.recentlyAdded) {
          console.log(`  [${bm.createdAt.slice(0, 10)}] ${bm.name} — ${bm.url}`);
        }
      }

      console.log("");
    });
}
