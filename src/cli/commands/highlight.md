# `highlight` Command

Mark bookmarks as highlighted for quick visual identification. Highlighted bookmarks are surfaced with a star (★) when listed.

## Usage

```bash
# Highlight a bookmark
shelf highlight <name>

# Remove a highlight
shelf highlight <name> --off

# List all highlighted bookmarks
shelf highlights
```

## Options

| Flag | Description |
|------|-------------|
| `--off` | Remove the highlight from the specified bookmark |
| `--store <path>` | Path to a custom bookmark store file |

## Examples

```bash
# Star your most-used bookmarks
shelf highlight github
shelf highlight docs

# View all starred bookmarks
shelf highlights
# Output:
# Highlighted bookmarks (2):
#
#   ★ github  [dev]
#     https://github.com
#   ★ docs  [reference]
#     https://docs.example.com

# Remove a highlight
shelf highlight github --off
```

## Notes

- Highlights are stored as a `highlighted: true` field on the bookmark object.
- Highlights persist across syncs and are included in exports.
- Use `shelf highlights` as a quick daily dashboard of important links.
