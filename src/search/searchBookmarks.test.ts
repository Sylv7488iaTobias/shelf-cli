import { describe, it, expect } from 'vitest';
import { searchBookmarks, SearchOptions } from './searchBookmarks';
import { Bookmark } from '../store/bookmarkStore';

const sampleBookmarks: Bookmark[] = [
  {
    id: '1',
    title: 'TypeScript Handbook',
    url: 'https://www.typescriptlang.org/docs/handbook/',
    tags: ['typescript', 'docs'],
    description: 'Official TypeScript documentation',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'GitHub',
    url: 'https://github.com',
    tags: ['git', 'code'],
    description: 'Where developers build software',
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Node.js Docs',
    url: 'https://nodejs.org/en/docs/',
    tags: ['nodejs', 'docs'],
    createdAt: new Date().toISOString(),
  },
];

describe('searchBookmarks', () => {
  it('matches by title', () => {
    const results = searchBookmarks(sampleBookmarks, { query: 'typescript' });
    expect(results).toHaveLength(1);
    expect(results[0].bookmark.id).toBe('1');
    expect(results[0].matchedOn).toContain('title');
  });

  it('matches by url', () => {
    const results = searchBookmarks(sampleBookmarks, { query: 'github.com' });
    expect(results).toHaveLength(1);
    expect(results[0].bookmark.id).toBe('2');
    expect(results[0].matchedOn).toContain('url');
  });

  it('matches by description', () => {
    const results = searchBookmarks(sampleBookmarks, { query: 'developers' });
    expect(results).toHaveLength(1);
    expect(results[0].bookmark.id).toBe('2');
    expect(results[0].matchedOn).toContain('description');
  });

  it('matches by tags', () => {
    const results = searchBookmarks(sampleBookmarks, { query: 'docs' });
    expect(results).toHaveLength(2);
  });

  it('filters by tag array', () => {
    const results = searchBookmarks(sampleBookmarks, {
      query: 'docs',
      tags: ['typescript'],
    });
    expect(results).toHaveLength(1);
    expect(results[0].bookmark.id).toBe('1');
  });

  it('is case-insensitive by default', () => {
    const results = searchBookmarks(sampleBookmarks, { query: 'GITHUB' });
    expect(results).toHaveLength(1);
  });

  it('respects caseSensitive option', () => {
    const results = searchBookmarks(sampleBookmarks, {
      query: 'GITHUB',
      caseSensitive: true,
    });
    expect(results).toHaveLength(0);
  });

  it('returns empty array when no matches', () => {
    const results = searchBookmarks(sampleBookmarks, { query: 'zzznomatch' });
    expect(results).toHaveLength(0);
  });
});
