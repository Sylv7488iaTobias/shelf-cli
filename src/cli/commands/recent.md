# `shelf recent` — Show Recently Added Bookmarks

Displays bookmarks sorted by their creation date, newest first.

## Usage

```bash
shelf recent [options]
```

## Options

| Flag | Alias | Default | Description |
|------|-------|---------|-------------|
| `--count <number>` | `-n` | `10` | Number of recent bookmarks to display |
| `--folder <folder>` | `-f` | — | Filter results to a specific folder |
| `--store <path>` | — | default store | Path to a custom bookmark store file |

## Examples

### Show the 10 most recently added bookmarks

```bash
shelf recent
```

### Show the 5 most recent bookmarks

```bash
shelf recent -n 5
```

### Show recent bookmarks in the "work" folder

```bash
shelf recent --folder work
```

### Combine count and folder filters

```bash
shelf recent -n 3 --folder personal
```

## Output Format

```
Recently added bookmarks (3):
────────────────────────────────────────
1. My Blog 📌
   https://myblog.com (writing) [blog, personal]
2. GitHub
   https://github.com (work) [dev]
3. Hacker News
   https://news.ycombinator.com [news]
```

## Notes

- Bookmarks without a `createdAt` timestamp are excluded from results.
- Folder matching is case-insensitive.
- Pinned bookmarks are indicated with a 📌 icon.
