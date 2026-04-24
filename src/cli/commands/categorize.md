# `shelf categorize`

Auto-assign categories to your bookmarks based on URL and title patterns.

## Usage

```
shelf categorize [options]
```

## Options

| Flag | Description |
|------|-------------|
| `-s, --store <path>` | Path to the bookmark store file |
| `--dry-run` | Preview which bookmarks would be categorized without saving |
| `--overwrite` | Overwrite categories that have already been set |

## Categories

The following categories are inferred automatically:

| Category | Matched patterns |
|----------|------------------|
| `code` | github.com, gitlab.com, bitbucket.org |
| `video` | youtube.com, vimeo.com, twitch.tv |
| `blog` | medium.com, dev.to, substack.com, URLs/titles containing "blog" |
| `social` | twitter.com, x.com, linkedin.com, reddit.com |
| `docs` | URLs/titles containing "docs", "documentation", "readme", "wiki" |
| `research` | arxiv.org, scholar.google.com, researchgate.net |
| `shopping` | amazon.com, URLs/titles containing "shop", "store", "buy" |
| `news` | hackernews, techcrunch, wired, URLs/titles containing "news" |
| `qa` | stackoverflow.com, stackexchange.com |
| `misc` | Everything else |

## Examples

```bash
# Preview what would be categorized
shelf categorize --dry-run

# Categorize all uncategorized bookmarks
shelf categorize

# Re-categorize everything, including already-categorized bookmarks
shelf categorize --overwrite
```

## Notes

- By default, bookmarks that already have a `category` field are skipped.
- Use `--overwrite` to re-run inference on all bookmarks.
- Categories are stored in the `category` field of each bookmark.
- You can combine `categorize` with `filter` to act on a subset of bookmarks.
