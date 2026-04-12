import { Command } from 'commander';
import { registerRemoveCommand } from './remove';
import * as bookmarkStore from '../../store/bookmarkStore';
import * as sync from '../../sync';
import { BookmarkStore } from '../../store/bookmarkStore';

jest.mock('../../store/bookmarkStore');
jest.mock('../../sync');

const mockStore: BookmarkStore = {
  bookmarks: [
    { id: 'abc123', url: 'https://example.com', title: 'Example', tags: [], createdAt: '2024-01-01T00:00:00.000Z' },
    { id: 'def456', url: 'https://other.com', title: 'Other', tags: [], createdAt: '2024-01-02T00:00:00.000Z' },
  ],
};

const mockUpdatedStore: BookmarkStore = {
  bookmarks: [
    { id: 'def456', url: 'https://other.com', title: 'Other', tags: [], createdAt: '2024-01-02T00:00:00.000Z' },
  ],
};

function makeProgram(): Command {
  const program = new Command();
  program.exitOverride();
  registerRemoveCommand(program);
  return program;
}

describe('remove command', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('process.exit'); });
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});

    (bookmarkStore.loadStore as jest.Mock).mockResolvedValue(mockStore);
    (bookmarkStore.removeBookmark as jest.Mock).mockReturnValue(mockUpdatedStore);
    (bookmarkStore.saveStore as jest.Mock).mockResolvedValue(undefined);
    (sync.commitBookmarkChanges as jest.Mock).mockResolvedValue(undefined);
    (sync.syncBookmarks as jest.Mock).mockResolvedValue(undefined);
  });

  it('removes a bookmark by ID', async () => {
    const program = makeProgram();
    await program.parseAsync(['node', 'shelf', 'remove', 'abc123', '--no-sync']);

    expect(bookmarkStore.loadStore).toHaveBeenCalled();
    expect(bookmarkStore.removeBookmark).toHaveBeenCalledWith(mockStore, 'abc123');
    expect(bookmarkStore.saveStore).toHaveBeenCalledWith(mockUpdatedStore);
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('abc123'));
  });

  it('exits with error when bookmark ID is not found', async () => {
    const program = makeProgram();
    await expect(
      program.parseAsync(['node', 'shelf', 'remove', 'nonexistent', '--no-sync'])
    ).rejects.toThrow('process.exit');

    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('No bookmark found'));
    expect(bookmarkStore.saveStore).not.toHaveBeenCalled();
  });

  it('syncs after removal when --no-sync is not passed', async () => {
    const program = makeProgram();
    await program.parseAsync(['node', 'shelf', 'remove', 'abc123']);

    expect(sync.commitBookmarkChanges).toHaveBeenCalled();
    expect(sync.syncBookmarks).toHaveBeenCalled();
  });

  it('warns but does not fail when sync throws', async () => {
    (sync.commitBookmarkChanges as jest.Mock).mockRejectedValue(new Error('git error'));
    const program = makeProgram();
    await program.parseAsync(['node', 'shelf', 'remove', 'abc123']);

    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('Could not sync'), expect.any(String));
  });
});
