import { Command } from "commander";
import { loadStore, saveStore } from "../../store/bookmarkStore";
import { Bookmark } from "../../store/bookmarkStore";

export function computeScore(bookmark: Bookmark): number {
  let score = 0;

  // Base score from rating (0–5 scale, weighted x10)
  if (typeof bookmark.rating === "number") {
    score += bookmark.rating * 10;
  }

  // Boost for pinned bookmarks
  if (bookmark.pinned) score += 15;

  // Boost for favorites
  if (bookmark.favorite) score += 10;

  // Boost for highlights
  if (bookmark.highlight) score += 8;

  // Recency boost: visits within last 30 days
  if (bookmark.lastVisited) {
    const daysSince =
      (Date.now() - new Date(bookmark.lastVisited).getTime()) /
      (1000 * 60 * 60 * 24);
    if (daysSince <= 30) score += Math.max(0, 10 - Math.floor(daysSince / 3));
  }

  // Tag richness bonus
  if (Array.isArray(bookmark.tags)) {
    score += Math.min(bookmark.tags.length * 2, 10);
  }

  // Notes bonus
  if (bookmark.notes && bookmark.notes.trim().length > 0) score += 5;

  // Penalty for archived
  if (bookmark.archived) score -= 20;

  return Math.max(0, score);
}

export function registerScoreCommand(program: Command): void {
  program
    .command("score [query]")
    .description("Show bookmarks ranked by computed relevance score")
    .option("-n, --limit <number>", "Number of results to show", "10")
    .option("-s, --store <path>", "Path to bookmark store")
    .action(async (query: string | undefined, opts) => {
      const store = await loadStore(opts.store);
      const limit = parseInt(opts.limit, 10);

      let bookmarks = store.bookmarks.filter((b) => !b.archived);

      if (query) {
        const q = query.toLowerCase();
        bookmarks = bookmarks.filter(
          (b) =>
            b.title.toLowerCase().includes(q) ||
            b.url.toLowerCase().includes(q) ||
            (b.tags ?? []).some((t) => t.toLowerCase().includes(q))
        );
      }

      const scored = bookmarks
        .map((b) => ({ bookmark: b, score: computeScore(b) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

      if (scored.length === 0) {
        console.log("No bookmarks found.");
        return;
      }

      for (const { bookmark, score } of scored) {
        console.log(`[${score.toString().padStart(3)}] ${bookmark.title}`);
        console.log(`       ${bookmark.url}`);
      }
    });
}
