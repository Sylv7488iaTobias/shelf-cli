import { Command } from 'commander';
import { loadStore, saveStore } from '../../store/bookmarkStore';

export function registerRemindCommand(program: Command): void {
  program
    .command('remind <name> <date>')
    .description('Set a reminder date on a bookmark (YYYY-MM-DD)')
    .option('-s, --store <path>', 'Path to bookmark store')
    .action(async (name: string, date: string, opts) => {
      const store = await loadStore(opts.store);
      const bookmark = store.bookmarks.find((b) => b.name === name);

      if (!bookmark) {
        console.error(`Bookmark "${name}" not found.`);
        process.exit(1);
      }

      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        console.error('Date must be in YYYY-MM-DD format.');
        process.exit(1);
      }

      (bookmark as any).remindAt = date;
      await saveStore(opts.store, store);
      console.log(`Reminder set for "${name}" on ${date}.`);
    });

  program
    .command('reminders')
    .description('List bookmarks with upcoming or past reminders')
    .option('-s, --store <path>', 'Path to bookmark store')
    .option('--overdue', 'Show only overdue reminders')
    .action(async (opts) => {
      const store = await loadStore(opts.store);
      const today = new Date().toISOString().slice(0, 10);

      const withReminders = store.bookmarks.filter((b) => !!(b as any).remindAt);

      const filtered = opts.overdue
        ? withReminders.filter((b) => (b as any).remindAt < today)
        : withReminders;

      if (filtered.length === 0) {
        console.log('No reminders found.');
        return;
      }

      for (const b of filtered.sort((a, z) =>
        ((a as any).remindAt as string).localeCompare((z as any).remindAt)
      )) {
        const flag = (b as any).remindAt < today ? '[OVERDUE]' : '[upcoming]';
        console.log(`${flag} ${(b as any).remindAt}  ${b.name}  ${b.url}`);
      }
    });
}
