import { Command } from 'commander';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import { registerDuplicateCommand } from './duplicate';

async function makeTempDir(): Promise<string> {
  return fs.mkdtemp(path.join(os.tmpdir(), 'shelf-duplicate-'));
}

function makeProgram(): Command {
  const program = new Command();
  program.exitOverride();
  registerDuplicateCommand(program);
  return program;
}

async function makeStorePath(dir: string, bookmarks: object[] = []): Promise<string> {
  const storePath = path.join(dir, 'bookmarks.json');
  await fs.writeFile(storePath, JSON.stringify({ bookmarks }), 'utf-8');
  return storePath;
}

describe('duplicate command', () => {
  it('duplicates an existing bookmark with default name', async () => {
    const dir = await makeTempDir();
    const storePath = await makeStorePath(dir, [
      { id: 'abc123', name: 'GitHub', url: 'https://github.com', tags: ['dev'], createdAt: '2024-01-01', updatedAt: '2024-01-01' },
    ]);

    const program = makeProgram();
    await program.parseAsync(['node', 'shelf', 'duplicate', 'abc123', '--store', storePath]);

    const raw = await fs.readFile(storePath, 'utf-8');
    const store = JSON.parse(raw);
    expect(store.bookmarks).toHaveLength(2);
    expect(store.bookmarks[1].name).toBe('GitHub (copy)');
    expect(store.bookmarks[1].url).toBe('https://github.com');
    expect(store.bookmarks[1].id).not.toBe('abc123');
  });

  it('duplicates with a custom name', async () => {
    const dir = await makeTempDir();
    const storePath = await makeStorePath(dir, [
      { id: 'abc123', name: 'GitHub', url: 'https://github.com', tags: [], createdAt: '2024-01-01', updatedAt: '2024-01-01' },
    ]);

    const program = makeProgram();
    await program.parseAsync(['node', 'shelf', 'duplicate', 'abc123', '--name', 'My GitHub', '--store', storePath]);

    const raw = await fs.readFile(storePath, 'utf-8');
    const store = JSON.parse(raw);
    expect(store.bookmarks[1].name).toBe('My GitHub');
  });

  it('duplicates with a custom URL', async () => {
    const dir = await makeTempDir();
    const storePath = await makeStorePath(dir, [
      { id: 'abc123', name: 'GitHub', url: 'https://github.com', tags: [], createdAt: '2024-01-01', updatedAt: '2024-01-01' },
    ]);

    const program = makeProgram();
    await program.parseAsync(['node', 'shelf', 'duplicate', 'abc123', '--url', 'https://gitlab.com', '--store', storePath]);

    const raw = await fs.readFile(storePath, 'utf-8');
    const store = JSON.parse(raw);
    expect(store.bookmarks[1].url).toBe('https://gitlab.com');
  });

  it('exits with error when bookmark id is not found', async () => {
    const dir = await makeTempDir();
    const storePath = await makeStorePath(dir, []);
    const program = makeProgram();

    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    await expect(
      program.parseAsync(['node', 'shelf', 'duplicate', 'nonexistent', '--store', storePath])
    ).rejects.toThrow('exit');

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('not found'));
    exitSpy.mockRestore();
    consoleSpy.mockRestore();
  });
});
