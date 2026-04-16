import { Command } from 'commander';
import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from 'path';
import { saveStore, loadStore } from '../../store/bookmarkStore';
import { registerLabelCommand } from './label';
import { registerListCommand } from './list';

async function makeTempDir() {
  return fs.mkdtemp(path.join(os.tmpdir(), 'shelf-label-int-'));
}

describe('label integration', () => {
  it('label persists and is readable via loadStore', async () => {
    const dir = await makeTempDir();
    const storePath = path.join(dir, 'store.json');
    await saveStore(storePath, {
      version: 1,
      bookmarks: [{ name: 'hn', url: 'https://news.ycombinator.com', tags: [], folder: '' }],
    });

    const program = new Command();
    program.exitOverride();
    registerLabelCommand(program);
    await program.parseAsync(['label', 'hn', 'Hacker News', '--store', storePath], { from: 'user' });

    const store = await loadStore(storePath);
    const bm = store.bookmarks.find((b) => b.name === 'hn') as any;
    expect(bm.label).toBe('Hacker News');
  });

  it('clearing a non-existent label is a no-op', async () => {
    const dir = await makeTempDir();
    const storePath = path.join(dir, 'store.json');
    await saveStore(storePath, {
      version: 1,
      bookmarks: [{ name: 'hn', url: 'https://news.ycombinator.com', tags: [], folder: '' }],
    });

    const program = new Command();
    program.exitOverride();
    registerLabelCommand(program);
    await program.parseAsync(['label', 'hn', 'x', '--clear', '--store', storePath], { from: 'user' });

    const store = await loadStore(storePath);
    const bm = store.bookmarks.find((b) => b.name === 'hn') as any;
    expect(bm.label).toBeUndefined();
  });
});
