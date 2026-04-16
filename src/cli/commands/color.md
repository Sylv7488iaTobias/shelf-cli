# `color` Command

Assign a visual color label to a bookmark for easier identification when listing or filtering.

## Usage

```
shelf color <name> <color>
```

## Arguments

| Argument | Description |
|----------|-------------|
| `name`   | The name of the bookmark to color |
| `color`  | The color to assign (or `none` to remove) |

## Options

| Option | Description |
|--------|-------------|
| `-s, --store <path>` | Path to the bookmark store file |

## Valid Colors

`red`, `green`, `blue`, `yellow`, `purple`, `orange`, `pink`, `none`

Use `none` to remove an existing color from a bookmark.

## Examples

```bash
# Assign blue to a bookmark
shelf color github blue

# Remove color from a bookmark
shelf color github none

# Use a custom store path
shelf color docs yellow --store ~/my-bookmarks.json
```

## Notes

- Colors are stored as metadata on the bookmark and can be used with `filter` and `list`.
- Color names are case-insensitive.
