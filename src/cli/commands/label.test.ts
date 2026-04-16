import { Command } from 'commander';
import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from 'path';
import { saveStore } from '../../store/bookmarkStore';
import { registerLabelCommand } from './label';

async function makeTempDir() {
  return fs.mkdtemp(path.join(os.tmpdir(), 'shelf-label-'));
}

function makeProgram() {
  const program = new Command();
  program.exitOverride();
  registerLabelCommand(program);
  return program;
}

const baseStore = () => ({
  version: 1,
  bookmarks: [{ name: 'gh', url: 'https://github.com', tags: [], folder: '' }],
});

describe('label command', () => {
  it('sets a label on a bookmark', async () => {
    const dir = await makeTempDir();
    const storePath = path.join(dir, 'store.json');
    await saveStore(storePath, baseStore());

    const program = makeProgram();
    await program.parseAsync(['label', 'gh', 'GitHub', '--store', storePath], { from: 'user' });

    const raw = JSON.parse(await fs.readFile(storePath, 'utf-8'));
    expect(raw.bookmarks[0].label).toBe('GitHub');
  });

  it('clears a label from a bookmark', async () => {
    const dir = await makeTempDir();
    const storePath = path.join(dir, 'store.json');
    const store = baseStore();
    (store.bookmarks[0] as any).label = 'OldLabel';
    await saveStore(storePath, store);

    const program = makeProgram();
    await program.parseAsync(['label', 'gh', 'x', '--clear', '--store', storePath], { from: 'user' });

    const raw = JSON.parse(await fs.readFile(storePath, 'utf-8'));
    expect(raw.bookmarks[0].label).toBeUndefined();
  });

  it('exits with error for unknown bookmark', async () => {
    const dir = await makeTempDir();
    const storePath = path.join(dir, 'store.json');
    await saveStore(storePath, baseStore());

    const program = makeProgram();
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    await expect(
      program.parseAsync(['label', 'nope', 'X', '--store', storePath], { from: 'user' })
    ).rejects.toThrow();
    exitSpy.mockRestore();
  });
});
