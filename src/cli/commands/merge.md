# `shelf merge`

Merge bookmarks from another shelf JSON store file into your current store.

## Usage

```
shelf merge <file> [options]
```

## Arguments

| Argument | Description                              |
|----------|------------------------------------------|
| `file`   | Path to another shelf JSON bookmark file |

## Options

| Flag        | Description                              |
|-------------|------------------------------------------|
| `--dry-run` | Preview changes without saving to disk   |

## Behavior

- Reads the target JSON file and parses it as an array of bookmarks.
- Compares each incoming bookmark against the current store by **URL** and **ID**.
- Bookmarks that share a URL or ID with an existing entry are **skipped** as duplicates.
- Unique bookmarks are appended to the store.
- Prints a summary: how many were added and how many were skipped.

## Examples

```bash
# Merge bookmarks from a backup file
shelf merge ~/Downloads/other-shelf.json

# Preview what would be merged without making changes
shelf merge ~/Downloads/other-shelf.json --dry-run
```

## Notes

- The source file must be a valid shelf JSON store (array of bookmark objects).
- This command does **not** automatically sync or commit changes. Run `shelf sync` afterward if needed.
- Duplicate detection is conservative: a bookmark is skipped if either its `id` **or** its `url` already exists in the store.
