# `rename` Command

Rename an existing bookmark's title by its unique ID.

## Usage

```
shelf rename <id> <newTitle> [options]
```

## Arguments

| Argument   | Description                          |
|------------|--------------------------------------|
| `id`       | The unique ID of the bookmark        |
| `newTitle` | The new title to assign the bookmark |

## Options

| Flag           | Description                                      |
|----------------|--------------------------------------------------|
| `-s, --sync`   | Commit and push changes to remote after renaming |

## Examples

```bash
# Rename a bookmark
shelf rename abc123 "My Updated Title"

# Rename and sync to remote
shelf rename abc123 "My Updated Title" --sync
```

## Notes

- The bookmark ID can be found using `shelf list` or `shelf search`.
- The title cannot be set to an empty or whitespace-only string.
- When `--sync` is used, the change is committed and pushed via the configured git remote.
