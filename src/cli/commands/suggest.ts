import { Command } from "commander";
import { loadStore } from "../../store/bookmarkStore";
import { Bookmark } from "../../store/bookmarkStore";

/**
 * Suggests bookmarks based on a seed bookmark's tags, folder, and domain.
 * Useful for discovering related bookmarks you may have forgotten about.
 */

/** Score a candidate bookmark's relevance to the seed */
function scoreRelevance(seed: Bookmark, candidate: Bookmark): number {
  if (candidate.id === seed.id) return -1;

  let score = 0;

  // Tag overlap
  const seedTags = new Set(seed.tags ?? []);
  for (const tag of candidate.tags ?? []) {
    if (seedTags.has(tag)) score += 3;
  }

  // Same folder
  if (
    seed.folder &&
    candidate.folder &&
    seed.folder === candidate.folder
  ) {
    score += 2;
  }

  // Same domain
  try {
    const seedHost = new URL(seed.url).hostname;
    const candidateHost = new URL(candidate.url).hostname;
    if (seedHost === candidateHost) score += 2;
  } catch {
    // ignore invalid URLs
  }

  // Boost pinned or favorited bookmarks slightly
  if (candidate.pinned) score += 1;
  if ((candidate as any).favorite) score += 1;

  return score;
}

/** Return the top-N related bookmarks for a given seed bookmark */
export function suggestRelated(
  seed: Bookmark,
  all: Bookmark[],
  limit: number
): Array<{ bookmark: Bookmark; score: number }> {
  return all
    .map((b) => ({ bookmark: b, score: scoreRelevance(seed, b) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function registerSuggestCommand(program: Command): void {
  program
    .command("suggest <name>")
    .description(
      "Suggest bookmarks related to the given bookmark by tags, folder, and domain"
    )
    .option("-n, --limit <number>", "Number of suggestions to show", "5")
    .option("-s, --store <path>", "Path to bookmark store")
    .action(async (name: string, options) => {
      const store = await loadStore(options.store);
      const limit = parseInt(options.limit, 10);

      const seed = store.bookmarks.find(
        (b) =>
          b.name === name ||
          b.id === name ||
          (b as any).alias === name
      );

      if (!seed) {
        console.error(`Bookmark "${name}" not found.`);
        process.exit(1);
      }

      const suggestions = suggestRelated(seed, store.bookmarks, limit);

      if (suggestions.length === 0) {
        console.log(`No related bookmarks found for "${seed.name}".`);
        return;
      }

      console.log(`Suggestions related to "${seed.name}":\n`);
      for (const { bookmark, score } of suggestions) {
        const tags =
          bookmark.tags && bookmark.tags.length > 0
            ? `  [${bookmark.tags.join(", ")}]`
            : "";
        const folder = bookmark.folder ? `  📁 ${bookmark.folder}` : "";
        console.log(
          `  ${bookmark.name}${folder}${tags}\n    ${bookmark.url}  (score: ${score})\n`
        );
      }
    });
}
