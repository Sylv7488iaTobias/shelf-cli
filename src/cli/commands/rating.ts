import { Command } from 'commander';
import { loadStore, saveStore } from '../../store/bookmarkStore';

type Rating = 1 | 2 | 3 | 4 | 5;

function isRating(value: number): value is Rating {
  return [1, 2, 3, 4, 5].includes(value);
}

export function registerRatingCommand(program: Command): void {
  program
    .command('rating <name> [stars]')
    .description('Set or view the rating (1–5) of a bookmark')
    .option('--store <path>', 'Path to bookmark store')
    .action(async (name: string, stars: string | undefined, opts) => {
      const store = await loadStore(opts.store);
      const bookmark = store.bookmarks.find((b) => b.name === name);

      if (!bookmark) {
        console.error(`Bookmark "${name}" not found.`);
        process.exit(1);
      }

      if (stars === undefined) {
        const current = (bookmark as any).rating;
        if (current) {
          console.log(`${name}: ${'★'.repeat(current)}${'☆'.repeat(5 - current)} (${current}/5)`);
        } else {
          console.log(`${name} has no rating.`);
        }
        return;
      }

      const parsed = parseInt(stars, 10);
      if (isNaN(parsed) || !isRating(parsed)) {
        console.error('Rating must be a number between 1 and 5.');
        process.exit(1);
      }

      (bookmark as any).rating = parsed;
      await saveStore(opts.store, store);
      console.log(`Rated "${name}": ${'★'.repeat(parsed)}${'☆'.repeat(5 - parsed)}`);
    });
}
