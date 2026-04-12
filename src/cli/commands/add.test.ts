import { jest } from '@jest/globals';
import { addCommand } from './add';

// Mock dependencies
jest.mock('../../store/bookmarkStore');
jest.mock('../../sync');

import { addBookmark } from '../../store/bookmarkStore';
import { commitBookmarkChanges } from '../../sync';

const mockAddBookmark = addBookmark as jest.MockedFunction<typeof addBookmark>;
const mockCommit = commitBookmarkChanges as jest.MockedFunction<
  typeof commitBookmarkChanges
>;

const MOCK_BOOKMARK = {
  id: 'abc123',
  url: 'https://example.com',
  title: 'Example',
  tags: ['dev'],
  createdAt: new Date().toISOString(),
};

beforeEach(() => {
  jest.clearAllMocks();
  mockAddBookmark.mockResolvedValue(MOCK_BOOKMARK);
  mockCommit.mockResolvedValue(undefined);
});

describe('addCommand', () => {
  it('adds a bookmark with title and tags', async () => {
    await addCommand('https://example.com', {
      title: 'Example',
      tags: 'dev',
    });

    expect(mockAddBookmark).toHaveBeenCalledWith({
      url: 'https://example.com',
      title: 'Example',
      tags: ['dev'],
    });
  });

  it('uses url as title when title is not provided', async () => {
    await addCommand('https://example.com', {});

    expect(mockAddBookmark).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'https://example.com' })
    );
  });

  it('handles empty tags gracefully', async () => {
    await addCommand('https://example.com', { tags: '' });

    expect(mockAddBookmark).toHaveBeenCalledWith(
      expect.objectContaining({ tags: [] })
    );
  });

  it('calls commitBookmarkChanges when --sync flag is set', async () => {
    await addCommand('https://example.com', { sync: true });

    expect(mockCommit).toHaveBeenCalledWith(
      expect.stringContaining('add bookmark')
    );
  });

  it('does not sync when --sync flag is not set', async () => {
    await addCommand('https://example.com', {});

    expect(mockCommit).not.toHaveBeenCalled();
  });

  it('exits with code 1 when addBookmark throws', async () => {
    mockAddBookmark.mockRejectedValue(new Error('disk full'));
    const exitSpy = jest
      .spyOn(process, 'exit')
      .mockImplementation(() => undefined as never);

    await addCommand('https://example.com', {});

    expect(exitSpy).toHaveBeenCalledWith(1);
    exitSpy.mockRestore();
  });
});
