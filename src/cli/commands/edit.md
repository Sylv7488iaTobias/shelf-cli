# `shelf edit` Command

Edit an existing bookmark's URL, tags, or description.

## Usage

```
shelf edit <name> [options]
```

## Arguments

| Argument | Description                          |
|----------|--------------------------------------|
| `name`   | The name of the bookmark to edit     |

## Options

| Option              | Description                                          |
|---------------------|------------------------------------------------------|
| `-u, --url <url>`   | Replace the bookmark's URL                           |
| `-t, --tags <tags>` | Replace all tags (comma-separated list)              |
| `-d, --desc <desc>` | Replace the bookmark's description                   |

## Examples

**Update the URL:**
```
shelf edit my-site --url https://new-url.com
```

**Update the tags:**
```
shelf edit my-site --tags dev,tools,reference
```

**Update the description:**
```
shelf edit my-site --desc "A great developer resource"
```

**Update multiple fields at once:**
```
shelf edit my-site --url https://new-url.com --tags dev,tools --desc "Updated"
```

## Notes

- At least one option (`--url`, `--tags`, or `--desc`) must be provided.
- If no options are given, a warning is printed and no changes are saved.
- The `updatedAt` timestamp is refreshed automatically on every successful edit.
- Tags are trimmed and empty entries are ignored.
