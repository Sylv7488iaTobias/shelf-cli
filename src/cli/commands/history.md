# `shelf history`

Display a log of recent bookmark actions performed in the current store.

## Usage

```
shelf history [options]
```

## Options

| Flag | Description | Default |
|------|-------------|---------|
| `-n, --limit <number>` | Number of entries to display (most recent first) | `20` |
| `--action <type>` | Filter entries by action type | — |
| `--id <bookmarkId>` | Filter entries by bookmark ID | — |

## Action Types

The following action types are recorded automatically by other commands:

- `add` — bookmark was added
- `remove` — bookmark was deleted
- `edit` — bookmark URL or title was changed
- `tag` — tags were added to a bookmark
- `untag` — tags were removed from a bookmark
- `archive` — bookmark was archived
- `unarchive` — bookmark was restored from archive
- `rename` — bookmark was renamed

## Examples

```bash
# Show last 20 actions
shelf history

# Show last 5 actions
shelf history --limit 5

# Show only 'add' actions
shelf history --action add

# Show all actions for a specific bookmark
shelf history --id abc123
```

## Storage

History is stored in `history.json` alongside your `bookmarks.json` file in the shelf store directory. It is included in git sync and will be committed along with bookmark changes.

## Notes

- History is append-only and is never automatically pruned.
- Use `--limit` to avoid overwhelming output in large stores.
- The `--action` and `--id` flags can be combined to narrow results.
