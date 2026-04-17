import { Command } from 'commander';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import { registerRemindCommand } from './remind';
import { registerAddCommand } from './add';
import { saveStore } from '../../store/bookmarkStore';

async function setup() {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'shelf-remind-int-'));
  const storePath = path.join(dir, 'store.json');
  await saveStore(storePath, { bookmarks: [] });

  const program = new Command();
  program.exitOverride();
  registerAddCommand(program);
  registerRemindCommand(program);
  return { program, storePath };
}

test('add then remind round-trip', async () => {
  const { program, storePath } = await setup();

  jest.spyOn(console, 'log').mockImplementation(() => {});

  await program.parseAsync(
    ['add', 'notes', 'https://notes.example.com', '--store', storePath],
    { from: 'user' }
  );

  await program.parseAsync(
    ['remind', 'notes', '2099-03-15', '--store', storePath],
    { from: 'user' }
  );

  const raw = JSON.parse(await fs.readFile(storePath, 'utf-8'));
  const bm = raw.bookmarks.find((b: any) => b.name === 'notes');
  expect(bm).toBeDefined();
  expect(bm.remindAt).toBe('2099-03-15');
});

test('reminders command reflects stored remindAt', async () => {
  const { program, storePath } = await setup();

  const store = {
    bookmarks: [
      { name: 'a', url: 'https://a.com', tags: [], folder: '', remindAt: '2099-01-01' },
      { name: 'b', url: 'https://b.com', tags: [], folder: '' },
    ],
  };
  await saveStore(storePath, store);

  const logs: string[] = [];
  jest.spyOn(console, 'log').mockImplementation((m) => logs.push(m));

  await program.parseAsync(['reminders', '--store', storePath], { from: 'user' });

  expect(logs.length).toBe(1);
  expect(logs[0]).toContain('a');
  expect(logs[0]).not.toContain('b');
});
