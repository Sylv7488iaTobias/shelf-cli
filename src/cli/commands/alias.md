# `alias` Command

Manage short, memorable aliases for bookmarks so you can reference them by name instead of ID.

## Usage

```
shelf alias <subcommand> [alias] [id] [options]
```

## Subcommands

| Subcommand | Description |
|------------|-------------|
| `set`      | Bind an alias name to a bookmark ID |
| `get`      | Resolve an alias to its bookmark URL |
| `remove`   | Delete an alias |
| `list`     | Show all defined aliases |

## Options

| Flag | Description |
|------|-------------|
| `-s, --store <path>` | Path to the bookmark store file |

## Examples

### Set an alias

```bash
shelf alias set gh abc123
# Alias "gh" -> abc123 (https://github.com)
```

### Get the URL for an alias

```bash
shelf alias get gh
# gh -> https://github.com
```

### Remove an alias

```bash
shelf alias remove gh
# Removed alias "gh"
```

### List all aliases

```bash
shelf alias list
# gh                   -> https://github.com
# docs                 -> https://docs.example.com
```

## Error Cases

| Situation | Error Message |
|-----------|---------------|
| Alias not found | `Error: No alias "<name>" found` |
| Bookmark ID not found during `set` | `Error: No bookmark with ID "<id>" exists` |
| Alias name already in use | `Error: Alias "<name>" already exists (use --force to overwrite)` |
| Missing required argument | `Error: Missing required argument: <argument>` |

## Notes

- Aliases are stored in the bookmark store file under an `aliases` key.
- If the bookmark an alias points to is deleted, the alias will display `(missing: <id>)` in the list.
- Alias names are case-sensitive.
- Alias names may only contain letters, numbers, hyphens, and underscores.
