import { Command } from 'commander';
import { registerRatingCommand } from './rating';
import * as bookmarkStore from '../../store/bookmarkStore';

function makeProgram() {
  const program = new Command();
  program.exitOverride();
  registerRatingCommand(program);
  return program;
}

function makeBookmark(overrides = {}) {
  return {
    name: 'example',
    url: 'https://example.com',
    tags: [],
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

describe('rating command', () => {
  let loadStore: jest.SpyInstance;
  let saveStore: jest.SpyInstance;

  beforeEach(() => {
    loadStore = jest.spyOn(bookmarkStore, 'loadStore');
    saveStore = jest.spyOn(bookmarkStore, 'saveStore').mockResolvedValue(undefined);
  });

  afterEach(() => jest.restoreAllMocks());

  it('sets a rating on a bookmark', async () => {
    const bm = makeBookmark();
    loadStore.mockResolvedValue({ bookmarks: [bm] });
    const program = makeProgram();
    await program.parseAsync(['node', 'shelf', 'rating', 'example', '4', '--store', '/tmp/store.json']);
    expect((bm as any).rating).toBe(4);
    expect(saveStore).toHaveBeenCalled();
  });

  it('shows current rating when no stars provided', async () => {
    const bm = makeBookmark({ rating: 3 });
    loadStore.mockResolvedValue({ bookmarks: [bm] });
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const program = makeProgram();
    await program.parseAsync(['node', 'shelf', 'rating', 'example', '--store', '/tmp/store.json']);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('★★★'));
    spy.mockRestore();
  });

  it('exits with error for invalid rating', async () => {
    const bm = makeBookmark();
    loadStore.mockResolvedValue({ bookmarks: [bm] });
    const spy = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    const program = makeProgram();
    await expect(
      program.parseAsync(['node', 'shelf', 'rating', 'example', '9', '--store', '/tmp/store.json'])
    ).rejects.toThrow();
    spy.mockRestore();
  });

  it('exits with error if bookmark not found', async () => {
    loadStore.mockResolvedValue({ bookmarks: [] });
    const spy = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    const program = makeProgram();
    await expect(
      program.parseAsync(['node', 'shelf', 'rating', 'missing', '3', '--store', '/tmp/store.json'])
    ).rejects.toThrow();
    spy.mockRestore();
  });
});
