import { Command } from 'commander';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import { registerVisibilityCommand, isVisibility } from './visibility';
import { saveStore } from '../../store/bookmarkStore';

async function makeTempDir() {
  return fs.mkdtemp(path.join(os.tmpdir(), 'shelf-visibility-'));
}

function makeProgram(storePath: string) {
  const program = new Command();
  program.exitOverride();
  registerVisibilityCommand(program);
  return { program, storePath };
}

describe('isVisibility', () => {
  it('accepts valid levels', () => {
    expect(isVisibility('public')).toBe(true);
    expect(isVisibility('private')).toBe(true);
    expect(isVisibility('unlisted')).toBe(true);
  });

  it('rejects invalid levels', () => {
    expect(isVisibility('hidden')).toBe(false);
    expect(isVisibility('')).toBe(false);
  });
});

describe('visibility command', () => {
  it('sets visibility on an existing bookmark', async () => {
    const dir = await makeTempDir();
    const storePath = path.join(dir, 'bookmarks.json');
    await saveStore(storePath, {
      bookmarks: [{ name: 'gh', url: 'https://github.com', tags: [], createdAt: new Date().toISOString() }],
    });

    const { program } = makeProgram(storePath);
    const logs: string[] = [];
    jest.spyOn(console, 'log').mockImplementation((msg) => logs.push(msg));

    await program.parseAsync(['visibility', 'gh', 'private', '--store', storePath], { from: 'user' });

    expect(logs[0]).toContain('private');

    const raw = JSON.parse(await fs.readFile(storePath, 'utf-8'));
    expect(raw.bookmarks[0].visibility).toBe('private');

    jest.restoreAllMocks();
    await fs.rm(dir, { recursive: true });
  });

  it('errors on unknown bookmark', async () => {
    const dir = await makeTempDir();
    const storePath = path.join(dir, 'bookmarks.json');
    await saveStore(storePath, { bookmarks: [] });

    const { program } = makeProgram(storePath);
    const errors: string[] = [];
    jest.spyOn(console, 'error').mockImplementation((msg) => errors.push(msg));
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });

    await expect(
      program.parseAsync(['visibility', 'missing', 'public', '--store', storePath], { from: 'user' })
    ).rejects.toThrow();

    expect(errors[0]).toContain('not found');
    jest.restoreAllMocks();
    await fs.rm(dir, { recursive: true });
  });
});
