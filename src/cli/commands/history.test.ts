import { Command } from 'commander';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import {
  getHistoryPath,
  loadHistory,
  appendHistory,
  formatHistoryEntry,
  registerHistoryCommand,
  HistoryEntry,
} from './history';

function makeTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'shelf-history-test-'));
}

function makeProgram(): Command {
  const program = new Command();
  program.exitOverride();
  registerHistoryCommand(program);
  return program;
}

const SAMPLE_ENTRY: HistoryEntry = {
  timestamp: new Date('2024-01-15T10:00:00Z').toISOString(),
  action: 'add',
  bookmarkId: 'abc123',
  details: 'https://example.com',
};

describe('loadHistory', () => {
  it('returns empty array when no history file exists', () => {
    const tmpDir = makeTempDir();
    jest.spyOn(require('./history'), 'getHistoryPath').mockReturnValue(
      path.join(tmpDir, 'history.json')
    );
    expect(loadHistory()).toEqual([]);
  });
});

describe('appendHistory', () => {
  it('creates history file and appends entry', () => {
    const tmpDir = makeTempDir();
    const histPath = path.join(tmpDir, 'history.json');
    jest.spyOn(require('./history'), 'getHistoryPath').mockReturnValue(histPath);

    appendHistory(SAMPLE_ENTRY);
    const data = JSON.parse(fs.readFileSync(histPath, 'utf-8'));
    expect(data).toHaveLength(1);
    expect(data[0].action).toBe('add');
  });
});

describe('formatHistoryEntry', () => {
  it('formats entry with padded action and details', () => {
    const result = formatHistoryEntry(SAMPLE_ENTRY);
    expect(result).toContain('ADD');
    expect(result).toContain('abc123');
    expect(result).toContain('https://example.com');
  });
});

describe('history command', () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    jest.restoreAllMocks();
  });

  it('prints no history message when empty', () => {
    jest.spyOn(require('./history'), 'loadHistory').mockReturnValue([]);
    const program = makeProgram();
    program.parse(['history'], { from: 'user' });
    expect(consoleSpy).toHaveBeenCalledWith('No history entries found.');
  });

  it('filters by action', () => {
    const entries: HistoryEntry[] = [
      { ...SAMPLE_ENTRY, action: 'add' },
      { ...SAMPLE_ENTRY, action: 'remove', bookmarkId: 'xyz' },
    ];
    jest.spyOn(require('./history'), 'loadHistory').mockReturnValue(entries);
    const program = makeProgram();
    program.parse(['history', '--action', 'remove'], { from: 'user' });
    expect(consoleSpy).toHaveBeenCalledTimes(1);
    expect(consoleSpy.mock.calls[0][0]).toContain('xyz');
  });

  it('respects --limit flag', () => {
    const entries: HistoryEntry[] = Array.from({ length: 10 }, (_, i) => ({
      ...SAMPLE_ENTRY,
      bookmarkId: `id${i}`,
    }));
    jest.spyOn(require('./history'), 'loadHistory').mockReturnValue(entries);
    const program = makeProgram();
    program.parse(['history', '--limit', '3'], { from: 'user' });
    expect(consoleSpy).toHaveBeenCalledTimes(3);
  });
});
