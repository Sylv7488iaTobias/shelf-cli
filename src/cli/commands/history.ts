import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import { getStorePath } from '../../store/bookmarkStore';

export interface HistoryEntry {
  timestamp: string;
  action: string;
  bookmarkId: string;
  details: string;
}

export function getHistoryPath(): string {
  const storePath = getStorePath();
  return path.join(path.dirname(storePath), 'history.json');
}

export function loadHistory(): HistoryEntry[] {
  const historyPath = getHistoryPath();
  if (!fs.existsSync(historyPath)) return [];
  try {
    return JSON.parse(fs.readFileSync(historyPath, 'utf-8'));
  } catch {
    return [];
  }
}

export function appendHistory(entry: HistoryEntry): void {
  const history = loadHistory();
  history.push(entry);
  fs.writeFileSync(getHistoryPath(), JSON.stringify(history, null, 2));
}

export function formatHistoryEntry(entry: HistoryEntry): string {
  const ts = new Date(entry.timestamp).toLocaleString();
  return `[${ts}] ${entry.action.toUpperCase().padEnd(8)} ${entry.bookmarkId} — ${entry.details}`;
}

export function registerHistoryCommand(program: Command): void {
  program
    .command('history')
    .description('Show recent bookmark actions')
    .option('-n, --limit <number>', 'Number of entries to show', '20')
    .option('--action <type>', 'Filter by action type (add, remove, edit, tag, etc.)')
    .option('--id <bookmarkId>', 'Filter by bookmark ID')
    .action((opts) => {
      const limit = parseInt(opts.limit, 10);
      let entries = loadHistory();

      if (opts.action) {
        entries = entries.filter((e) => e.action === opts.action);
      }
      if (opts.id) {
        entries = entries.filter((e) => e.bookmarkId === opts.id);
      }

      const recent = entries.slice(-limit).reverse();

      if (recent.length === 0) {
        console.log('No history entries found.');
        return;
      }

      recent.forEach((entry) => console.log(formatHistoryEntry(entry)));
    });
}
