# `shelf score` — Relevance Scoring

Rank your bookmarks by a computed relevance score based on multiple signals.

## Usage

```
shelf score [query] [options]
```

## Arguments

| Argument | Description                                          |
|----------|------------------------------------------------------|
| `query`  | Optional keyword to filter bookmarks before scoring  |

## Options

| Flag                  | Default | Description                        |
|-----------------------|---------|------------------------------------|
| `-n, --limit <number>`| `10`    | Number of top results to display   |
| `-s, --store <path>`  | auto    | Path to the bookmark store file    |

## Scoring Signals

The score for each bookmark is computed from the following signals:

| Signal              | Points                        |
|---------------------|-------------------------------|
| Rating (0–5)        | `rating × 10`                 |
| Pinned              | +15                           |
| Favorite            | +10                           |
| Highlight           | +8                            |
| Recent visit (30d)  | up to +10 (decays over time)  |
| Tags richness       | `min(tags × 2, 10)`           |
| Has notes           | +5                            |
| Archived            | −20                           |

Scores are always clamped to a minimum of `0`.

## Examples

```bash
# Show top 10 bookmarks by score
shelf score

# Show top 5 TypeScript-related bookmarks
shelf score typescript --limit 5

# Use a custom store path
shelf score --store ~/my-bookmarks.json
```

## Output Format

```
[ 55] TypeScript Deep Dive
       https://basarat.gitbook.io/typescript/
[ 30] Node.js Best Practices
       https://github.com/goldbergyoni/nodebestpractices
```
