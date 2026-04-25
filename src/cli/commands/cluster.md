# `shelf cluster`

Group your bookmarks into clusters based on shared attributes — currently **domain** or **tag**.

## Usage

```
shelf cluster [options]
```

## Options

| Flag | Description | Default |
|------|-------------|---------|
| `-b, --by <field>` | Cluster by `domain` or `tag` | `domain` |
| `-n, --min <count>` | Minimum cluster size to show | `1` |
| `--store <path>` | Path to bookmark store | auto-detected |

## Examples

### Cluster by domain

```
$ shelf cluster

[github.com] (12)
  awesome-ts — https://github.com/dzharii/awesome-typescript
  shelf-cli — https://github.com/you/shelf-cli
  ...

[news.ycombinator.com] (5)
  Ask HN: ... — https://news.ycombinator.com/item?id=...
  ...
```

### Cluster by tag, minimum 3 bookmarks

```
$ shelf cluster --by tag --min 3

[dev] (8)
  ...

[reading] (4)
  ...
```

## Notes

- `www.` prefixes are stripped from domain names for cleaner grouping.
- Bookmarks with no tags appear under `untagged` when clustering by tag.
- Clusters are sorted by size (largest first).
- Use `--min` to hide noise from singleton clusters.
