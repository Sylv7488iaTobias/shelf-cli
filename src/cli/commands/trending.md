# `shelf trending`

Show the most trending bookmarks based on visit frequency and recency.

## Usage

```
shelf trending [options]
```

## Options

| Option | Description | Default |
|---|---|---|
| `-n, --limit <number>` | Number of results to show | `10` |
| `-f, --folder <folder>` | Filter results to a specific folder | |
| `--json` | Output results as JSON | |

## Trending Score

The trending score is calculated using:

```
score = visits / sqrt(ageDays) + recencyBonus
```

Where:
- **visits** — total number of times the bookmark has been opened
- **ageDays** — number of days since the bookmark was added
- **recencyBonus** — up to `+15` points for bookmarks visited within the last 30 days

This means a bookmark with many recent visits will rank higher than one with the same total visits but no recent activity.

## Examples

```bash
# Show top 10 trending bookmarks
shelf trending

# Show top 5 trending bookmarks
shelf trending --limit 5

# Show trending bookmarks in the "work" folder
shelf trending --folder work

# Output as JSON for scripting
shelf trending --json
```

## Notes

- Archived bookmarks are excluded from trending results.
- Bookmarks without any visits will still appear but rank lower.
- Use `shelf top` to see bookmarks ranked purely by total visit count.
