# `shelf stats`

Display statistics and insights about your bookmark collection.

## Usage

```
shelf stats
```

## Output

The command prints a summary including:

- **Total bookmarks** — the number of saved bookmarks.
- **Unique tags** — how many distinct tags are in use.
- **Pinned** — how many bookmarks are currently pinned.
- **Top Tags** — up to 5 most-used tags with their usage counts.
- **Recently Added** — up to 5 bookmarks sorted by `createdAt` date (newest first).

## Example

```
📚 Bookmark Stats
  Total bookmarks : 42
  Unique tags     : 11
  Pinned          : 3

🏷️  Top Tags:
  dev                  15
  typescript           10
  tools                8
  reference            6
  css                  4

🕒 Recently Added:
  [2024-06-01] Bun Docs — https://bun.sh/docs
  [2024-05-28] Zod — https://zod.dev
  [2024-05-20] Effect TS — https://effect.website
```

## Notes

- Bookmarks without a `createdAt` field are excluded from the **Recently Added** list.
- The command is read-only and does not modify the store.
