import { Command } from 'commander';
import { registerListCommand } from './list';
import * as bookmarkStore from '../../store/bookmarkStore';
import * as formatModule from '../../search/index';

function makeProgram(): Command {
  const program = new Command();
  program.exitOverride();
  registerListCommand(program);
  return program;
}

const mockBookmarks = [
  { id: '1', url: 'https://example.com', title: 'Example', tags: ['web'], createdAt: new Date().toISOString() },
  { id: '2', url: 'https://typescript.org', title: 'TypeScript', tags: ['dev'], createdAt: new Date().toISOString() },
];

describe('list command', () => {
  let loadStoreSpy: jest.SpyInstance;
  let formatSpy: jest.SpyInstance;
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    loadStoreSpy = jest.spyOn(bookmarkStore, 'loadStore').mockResolvedValue({ bookmarks: mockBookmarks } as any);
    formatSpy = jest.spyOn(formatModule, 'formatSearchResults').mockReturnValue('formatted list');
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('lists all bookmarks', async () => {
    const program = makeProgram();
    await program.parseAsync(['node', 'test', 'list']);
    expect(loadStoreSpy).toHaveBeenCalled();
    expect(formatSpy).toHaveBeenCalledWith(mockBookmarks);
    expect(consoleSpy).toHaveBeenCalledWith('formatted list');
  });

  it('shows message when store is empty', async () => {
    loadStoreSpy.mockResolvedValue({ bookmarks: [] } as any);
    const program = makeProgram();
    await program.parseAsync(['node', 'test', 'list']);
    expect(consoleSpy).toHaveBeenCalledWith(
      'No bookmarks saved yet. Use `shelf add <url>` to add one.'
    );
  });

  it('filters by tag', async () => {
    const program = makeProgram();
    await program.parseAsync(['node', 'test', 'list', '--tag', 'dev']);
    expect(formatSpy).toHaveBeenCalledWith([mockBookmarks[1]]);
  });

  it('shows message when tag filter returns no results', async () => {
    const program = makeProgram();
    await program.parseAsync(['node', 'test', 'list', '--tag', 'nonexistent']);
    expect(consoleSpy).toHaveBeenCalledWith('No bookmarks found with tag "nonexistent"');
  });

  it('outputs JSON when --json flag is passed', async () => {
    const program = makeProgram();
    await program.parseAsync(['node', 'test', 'list', '--json']);
    expect(consoleSpy).toHaveBeenCalledWith(JSON.stringify(mockBookmarks, null, 2));
  });

  it('respects --limit option', async () => {
    const program = makeProgram();
    await program.parseAsync(['node', 'test', 'list', '--limit', '1']);
    expect(formatSpy).toHaveBeenCalledWith([mockBookmarks[0]]);
  });
});
