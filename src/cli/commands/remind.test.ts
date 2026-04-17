import { Command } from 'commander';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import { registerRemindCommand } from './remind';
import { saveStore } from '../../store/bookmarkStore';

async function makeTempDir() {
  return fs.mkdtemp(path.join(os.tmpdir(), 'shelf-remind-'));
}

function makeProgram(storePath: string) {
  const program = new Command();
  program.exitOverride();
  registerRemindCommand(program);
  return { program, storePath };
}

const baseStore = () => ({
  bookmarks: [{ name: 'gh', url: 'https://github.com', tags: [], folder: '' }],
});

test('sets a reminder on an existing bookmark', async () => {
  const dir = await makeTempDir();
  const storePath = path.join(dir, 'store.json');
  await saveStore(storePath, baseStore());
  const { program } = makeProgram(storePath);

  const logs: string[] = [];
  jest.spyOn(console, 'log').mockImplementation((m) => logs.push(m));

  await program.parseAsync(['remind', 'gh', '2099-01-01', '--store', storePath], { from: 'user' });

  expect(logs[0]).toContain('Reminder set for "gh" on 2099-01-01');
  const raw = JSON.parse(await fs.readFile(storePath, 'utf-8'));
  expect(raw.bookmarks[0].remindAt).toBe('2099-01-01');
});

test('errors on unknown bookmark', async () => {
  const dir = await makeTempDir();
  const storePath = path.join(dir, 'store.json');
  await saveStore(storePath, baseStore());
  const { program } = makeProgram(storePath);

  const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
  jest.spyOn(console, 'error').mockImplementation(() => {});

  await expect(
    program.parseAsync(['remind', 'missing', '2099-01-01', '--store', storePath], { from: 'user' })
  ).rejects.toThrow();
  mockExit.mockRestore();
});

test('lists reminders', async () => {
  const dir = await makeTempDir();
  const storePath = path.join(dir, 'store.json');
  const store = baseStore();
  (store.bookmarks[0] as any).remindAt = '2099-06-15';
  await saveStore(storePath, store);
  const { program } = makeProgram(storePath);

  const logs: string[] = [];
  jest.spyOn(console, 'log').mockImplementation((m) => logs.push(m));

  await program.parseAsync(['reminders', '--store', storePath], { from: 'user' });
  expect(logs[0]).toContain('2099-06-15');
  expect(logs[0]).toContain('gh');
});

test('--overdue shows only past reminders', async () => {
  const dir = await makeTempDir();
  const storePath = path.join(dir, 'store.json');
  const store = {
    bookmarks: [
      { name: 'old', url: 'https://old.com', tags: [], folder: '', remindAt: '2000-01-01' },
      { name: 'future', url: 'https://future.com', tags: [], folder: '', remindAt: '2099-01-01' },
    ],
  };
  await saveStore(storePath, store);
  const { program } = makeProgram(storePath);

  const logs: string[] = [];
  jest.spyOn(console, 'log').mockImplementation((m) => logs.push(m));

  await program.parseAsync(['reminders', '--overdue', '--store', storePath], { from: 'user' });
  expect(logs.length).toBe(1);
  expect(logs[0]).toContain('OVERDUE');
  expect(logs[0]).toContain('old');
});
