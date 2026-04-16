# `shelf label`

Set or remove a custom display label on a bookmark.

## Usage

```
shelf label <name> <label> [options]
```

## Arguments

| Argument | Description                        |
|----------|------------------------------------|
| `name`   | The bookmark name to update        |
| `label`  | The display label to assign        |

## Options

| Flag              | Description                          |
|-------------------|--------------------------------------|
| `--clear`         | Remove the label from the bookmark   |
| `-s, --store`     | Path to the bookmark store file      |

## Examples

```bash
# Set a label
shelf label gh "GitHub Home"

# Clear the label
shelf label gh --clear
```

## Notes

- Labels are for display purposes only and do not affect searching or filtering by default.
- The `name` field is still used as the primary identifier.
