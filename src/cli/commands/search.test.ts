import { Command } from 'commander';
import { registerSearchCommand } from './search';
import * as bookmarkStore from '../../store/bookmarkStore';
import * as searchModule from '../../search/searchBookmarks';
import * as formatModule from '../../search/index';

function makeProgram(): Command {
  const program = new Command();
  program.exitOverride();
  registerSearchCommand(program);
  return program;
}

const mockBookmarks = [
  { id: '1', url: 'https://example.com', title: 'Example', tags: ['web'], createdAt: new Date().toISOString() },
  { id: '2', url: 'https://typescript.org', title: 'TypeScript', tags: ['dev', 'ts'], createdAt: new Date().toISOString() },
];

const mockStore = { bookmarks: mockBookmarks };

describe('search command', () => {
  let loadStoreSpy: jest.SpyInstance;
  let searchSpy: jest.SpyInstance;
  let formatSpy: jest.SpyInstance;
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    loadStoreSpy = jest.spyOn(bookmarkStore, 'loadStore').mockResolvedValue(mockStore as any);
    searchSpy = jest.spyOn(searchModule, 'searchBookmarks').mockReturnValue(mockBookmarks);
    formatSpy = jest.spyOn(formatModule, 'formatSearchResults').mockReturnValue('formatted results');
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('searches bookmarks and prints formatted results', async () => {
    const program = makeProgram();
    await program.parseAsync(['node', 'test', 'search', 'example']);
    expect(loadStoreSpy).toHaveBeenCalled();
    expect(searchSpy).toHaveBeenCalledWith(mockBookmarks, 'example');
    expect(consoleSpy).toHaveBeenCalledWith('formatted results');
  });

  it('outputs JSON when --json flag is passed', async () => {
    const program = makeProgram();
    await program.parseAsync(['node', 'test', 'search', 'example', '--json']);
    expect(consoleSpy).toHaveBeenCalledWith(JSON.stringify(mockBookmarks, null, 2));
  });

  it('filters by tag when --tag is provided', async () => {
    searchSpy.mockReturnValue(mockBookmarks);
    const program = makeProgram();
    await program.parseAsync(['node', 'test', 'search', 'example', '--tag', 'dev']);
    expect(formatSpy).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ tags: expect.arrayContaining(['dev']) })]
    ));
  });

  it('shows message when no results found', async () => {
    searchSpy.mockReturnValue([]);
    const program = makeProgram();
    await program.parseAsync(['node', 'test', 'search', 'nothing']);
    expect(consoleSpy).toHaveBeenCalledWith('No bookmarks found matching "nothing"');
  });

  it('respects --limit option', async () => {
    searchSpy.mockReturnValue(mockBookmarks);
    const program = makeProgram();
    await program.parseAsync(['node', 'test', 'search', 'example', '--limit', '1']);
    expect(formatSpy).toHaveBeenCalledWith([mockBookmarks[0]]);
  });
});
