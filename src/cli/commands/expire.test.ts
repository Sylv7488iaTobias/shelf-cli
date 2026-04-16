import { Command } from 'commander';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import { registerExpireCommand } from './expire';

async function makeTempDir() {
  return fs.mkdtemp(path.join(os.tmpdir(), 'shelf-expire-'));
}

async function makeProgram(storePath: string, bookmarks: object[]) {
  await fs.writeFile(storePath, JSON.stringify({ bookmarks }), 'utf-8');
  const program = new Command();
  program.exitOverride();
  registerExpireCommand(program);
  return program;
}

function makeBookmark(id: string, name: string, daysAgo: number) {
  const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();
  return { id, name, url: `https://example.com/${id}`, tags: [], createdAt };
}

describe('expire command', () => {
  it('removes bookmarks older than threshold', async () => {
    const dir = await makeTempDir();
    const storePath = path.join(dir, 'bookmarks.json');
    const bookmarks = [
      makeBookmark('a', 'Old', 40),
      makeBookmark('b', 'New', 5),
    ];
    const program = await makeProgram(storePath, bookmarks);
    await program.parseAsync(['expire', '30', '--store', storePath], { from: 'user' });
    const raw = JSON.parse(await fs.readFile(storePath, 'utf-8'));
    expect(raw.bookmarks).toHaveLength(1);
    expect(raw.bookmarks[0].id).toBe('b');
  });

  it('does not remove anything on dry-run', async () => {
    const dir = await makeTempDir();
    const storePath = path.join(dir, 'bookmarks.json');
    const bookmarks = [makeBookmark('a', 'Old', 40)];
    const program = await makeProgram(storePath, bookmarks);
    await program.parseAsync(['expire', '30', '--dry-run', '--store', storePath], { from: 'user' });
    const raw = JSON.parse(await fs.readFile(storePath, 'utf-8'));
    expect(raw.bookmarks).toHaveLength(1);
  });

  it('prints message when no expired bookmarks found', async () => {
    const dir = await makeTempDir();
    const storePath = path.join(dir, 'bookmarks.json');
    const bookmarks = [makeBookmark('a', 'New', 2)];
    const program = await makeProgram(storePath, bookmarks);
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    await program.parseAsync(['expire', '30', '--store', storePath], { from: 'user' });
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('No bookmarks'));
    spy.mockRestore();
  });
});
