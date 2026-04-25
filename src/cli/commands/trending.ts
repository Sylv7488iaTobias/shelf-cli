import { Command } from "commander";
import { loadStore } from "../../store/bookmarkStore";
import { Bookmark } from "../../store/bookmarkStore";

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export function computeTrendingScore(bookmark: Bookmark, now: Date = new Date()): number {
  const visits = bookmark.visits ?? 0;
  const addedAt = bookmark.addedAt ? new Date(bookmark.addedAt) : now;
  const lastVisited = bookmark.lastVisited ? new Date(bookmark.lastVisited) : null;

  const ageDays = Math.max(1, (now.getTime() - addedAt.getTime()) / MS_PER_DAY);
  const recencyBonus = lastVisited
    ? Math.max(0, 30 - (now.getTime() - lastVisited.getTime()) / MS_PER_DAY)
    : 0;

  return visits / Math.sqrt(ageDays) + recencyBonus * 0.5;
}

export function formatTrendingBookmark(
  bookmark: Bookmark,
  rank: number,
  score: number
): string {
  const tags = bookmark.tags?.length ? `  [${bookmark.tags.join(", ")}]` : "";
  const visits = bookmark.visits ?? 0;
  return `${rank}. ${bookmark.name} (score: ${score.toFixed(2)}, visits: ${visits})\n   ${bookmark.url}${tags}`;
}

export function registerTrendingCommand(program: Command): void {
  program
    .command("trending")
    .description("Show trending bookmarks based on visit frequency and recency")
    .option("-n, --limit <number>", "Number of results to show", "10")
    .option("-f, --folder <folder>", "Filter by folder")
    .option("--json", "Output as JSON")
    .action(async (opts) => {
      const store = await loadStore();
      const limit = parseInt(opts.limit, 10);
      const now = new Date();

      let bookmarks = store.bookmarks.filter((b) => !b.archived);

      if (opts.folder) {
        bookmarks = bookmarks.filter((b) => b.folder === opts.folder);
      }

      const scored = bookmarks
        .map((b) => ({ bookmark: b, score: computeTrendingScore(b, now) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

      if (scored.length === 0) {
        console.log("No trending bookmarks found.");
        return;
      }

      if (opts.json) {
        console.log(JSON.stringify(scored.map((s) => ({ ...s.bookmark, trendingScore: s.score })), null, 2));
        return;
      }

      console.log(`\nTrending Bookmarks (top ${scored.length}):\n`);
      scored.forEach((s, i) => {
        console.log(formatTrendingBookmark(s.bookmark, i + 1, s.score));
      });
    });
}
