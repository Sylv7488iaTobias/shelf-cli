# `shelf batch` — Bulk Import Bookmarks from a JSON File

The `batch` command lets you add multiple bookmarks at once by reading from a structured JSON file. This is useful for migrating bookmarks from another tool, seeding a fresh store, or scripting bulk additions.

## Usage

```bash
shelf batch <file> [options]
```

### Arguments

| Argument | Description |
|----------|-------------|
| `<file>` | Path to a JSON file containing an array of bookmark entries |

### Options

| Flag | Description |
|------|-------------|
| `--dry-run` | Preview the bookmarks that would be added without writing to the store |

## File Format

The input file must be a valid JSON array where each element is a bookmark object:

```json
[
  {
    "url": "https://example.com",
    "name": "Example Site",
    "tags": ["reference", "web"],
    "folder": "work"
  },
  {
    "url": "https://github.com",
    "name": "GitHub"
  }
]
```

### Required Fields

- `url` — The bookmark URL (must be a non-empty string)
- `name` — A human-readable label for the bookmark

### Optional Fields

- `tags` — An array of tag strings
- `folder` — A folder/category name

## Examples

```bash
# Import all bookmarks from a file
shelf batch ./my-bookmarks.json

# Preview what would be imported without saving
shelf batch ./my-bookmarks.json --dry-run
```

## Notes

- Bookmarks with a URL that already exists in the store will be **skipped** (no duplicates).
- The command reports how many bookmarks were added and how many were skipped.
- Use `shelf dedupe` after batch imports if you suspect existing duplicates in the store.
