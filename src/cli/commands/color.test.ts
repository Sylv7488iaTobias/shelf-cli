import { Command } from 'commander';
import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from 'path';
import { registerColorCommand } from './color';
import { saveStore } from '../../store/bookmarkStore';

async function makeTempDir() {
  return fs.mkdtemp(path.join(os.tmpdir(), 'shelf-color-'));
}

function makeProgram() {
  const program = new Command();
  program.exitOverride();
  registerColorCommand(program);
  return program;
}

async function makeStore(storePath: string, bookmarks: any[]) {
  await saveStore(storePath, { bookmarks });
}

describe('color command', () => {
  it('sets a color on a bookmark', async () => {
    const dir = await makeTempDir();
    const storePath = path.join(dir, 'bookmarks.json');
    await makeStore(storePath, [{ name: 'gh', url: 'https://github.com' }]);

    const program = makeProgram();
    await program.parseAsync(['node', 'shelf', 'color', 'gh', 'blue', '--store', storePath]);

    const data = JSON.parse(await fs.readFile(storePath, 'utf-8'));
    expect(data.bookmarks[0].color).toBe('blue');
  });

  it('removes color when set to none', async () => {
    const dir = await makeTempDir();
    const storePath = path.join(dir, 'bookmarks.json');
    await makeStore(storePath, [{ name: 'gh', url: 'https://github.com', color: 'red' }]);

    const program = makeProgram();
    await program.parseAsync(['node', 'shelf', 'color', 'gh', 'none', '--store', storePath]);

    const data = JSON.parse(await fs.readFile(storePath, 'utf-8'));
    expect(data.bookmarks[0].color).toBeUndefined();
  });

  it('exits with error for invalid color', async () => {
    const dir = await makeTempDir();
    const storePath = path.join(dir, 'bookmarks.json');
    await makeStore(storePath, [{ name: 'gh', url: 'https://github.com' }]);

    const program = makeProgram();
    const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    await expect(
      program.parseAsync(['node', 'shelf', 'color', 'gh', 'rainbow', '--store', storePath])
    ).rejects.toThrow();
    mockExit.mockRestore();
  });

  it('exits with error when bookmark not found', async () => {
    const dir = await makeTempDir();
    const storePath = path.join(dir, 'bookmarks.json');
    await makeStore(storePath, []);

    const program = makeProgram();
    const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    await expect(
      program.parseAsync(['node', 'shelf', 'color', 'missing', 'red', '--store', storePath])
    ).rejects.toThrow();
    mockExit.mockRestore();
  });
});
