# `shelf pin` Command

Pin or unpin a bookmark so it appears at the top of `shelf list` output.

## Usage

```bash
shelf pin <name> [options]
```

## Arguments

| Argument | Description                        |
|----------|------------------------------------|
| `name`   | The name of the bookmark to pin    |

## Options

| Flag          | Description                                  |
|---------------|----------------------------------------------|
| `--unpin`     | Remove the pin from the bookmark             |
| `--store`     | Path to a custom bookmark store file         |
| `--no-sync`   | Skip committing and syncing the change       |

## Examples

```bash
# Pin a bookmark
shelf pin github

# Unpin a bookmark
shelf pin github --unpin

# Pin without syncing to remote
shelf pin docs --no-sync
```

## Notes

- Pinned bookmarks are shown first when running `shelf list`.
- Pinning an already-pinned bookmark (or unpinning an unpinned one) is a no-op.
- The `pinned` field is stored as a boolean on the bookmark entry in the JSON store.
