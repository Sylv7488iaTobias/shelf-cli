# `shelf lint`

Check your bookmarks for common issues such as invalid URLs, missing titles, and duplicate tags.

## Usage

```bash
shelf lint [options]
```

## Options

| Option   | Description                                      |
|----------|--------------------------------------------------|
| `--fix`  | Attempt to auto-fix fixable issues (e.g. deduplicate tags) |
| `--json` | Output all issues as a JSON array                |

## What It Checks

- **Missing URL** — Bookmarks with an empty or absent URL field.
- **Invalid URL** — URLs that cannot be parsed by the WHATWG URL standard.
- **Missing title** — Bookmarks with an empty or absent title field.
- **Duplicate tags** — Tags that appear more than once on the same bookmark.
- **Overly long title** — Titles exceeding 200 characters.

## Examples

### Run a lint check

```bash
shelf lint
```

Output:
```
⚠️  Found 2 issue(s):

  [abc123] "Old Post" — url: Invalid URL: htp://broken
  [def456] "" — title: Title is missing or empty

Run with --fix to attempt auto-fixes.
```

### Output as JSON

```bash
shelf lint --json
```

```json
[
  {
    "id": "abc123",
    "title": "Old Post",
    "field": "url",
    "message": "Invalid URL: htp://broken"
  }
]
```

### Auto-fix issues

```bash
shelf lint --fix
```

Currently auto-fixes:
- Removes duplicate tags from bookmarks.
