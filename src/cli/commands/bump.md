# `shelf bump`

Refresh the `updatedAt` timestamp of a bookmark to the current time.

This is useful when you want a bookmark to appear at the top of
recency-sorted views (`shelf recent`) without editing its content.

## Usage

```bash
shelf bump <name> [options]
```

## Arguments

| Argument | Description |
|----------|-------------|
| `name`   | The name of the bookmark to bump |

## Options

| Flag | Description |
|------|-------------|
| `-s, --store <path>` | Path to a custom bookmark store file |

## Examples

### Bump a bookmark by name

```bash
shelf bump "My Favourite Article"
```

Output:
```
Bumped "My Favourite Article"
  Previous: 2024-03-10T08:22:00.000Z
  Now:      2024-06-01T14:55:30.123Z
```

### Bump using a custom store path

```bash
shelf bump "Work Docs" --store ~/work/bookmarks.json
```

## Notes

- The bookmark's `url`, `tags`, and other fields are **not** modified.
- Only `updatedAt` is changed.
- The command is case-insensitive when matching the bookmark name.
