# `shelf reorder`

Reorder bookmarks by promoting specific entries to the top of your store.

## Usage

```
shelf reorder <id1> [id2 ...] [options]
```

## Arguments

| Argument | Description |
|----------|-------------|
| `ids...` | One or more bookmark IDs to move to the top (space-separated) |

## Options

| Flag | Description |
|------|-------------|
| `-s, --store <path>` | Path to a custom bookmark store file |

## Description

The `reorder` command lets you manually promote bookmarks to the top of your
bookmark list. This is useful when you want to surface frequently used or
high-priority bookmarks without changing their metadata.

Bookmarks are moved to the front of the list in the order you specify them.
All other bookmarks remain in their original relative order after the
promoted entries.

## Examples

```bash
# Move bookmark with ID "abc123" to the top
shelf reorder abc123

# Move two bookmarks to the top, in order
shelf reorder abc123 def456

# Use a custom store path
shelf reorder abc123 --store ~/my-bookmarks.json
```

## Notes

- If any of the provided IDs do not exist in the store, the command will
  print an error and exit without modifying the store.
- The reorder is persisted immediately to the store file.
- To view current bookmark IDs, use `shelf list`.
