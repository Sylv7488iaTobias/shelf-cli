# `shelf top` — Show Most Recently Added Bookmarks

Display the most recently added bookmarks, ranked from newest to oldest. Useful for reviewing what you've saved lately or quickly revisiting a recently bookmarked resource.

## Usage

```bash
shelf top [options]
```

## Options

| Option | Alias | Description | Default |
|---|---|---|---|
| `--count <number>` | `-n` | Number of bookmarks to display | `10` |
| `--folder <folder>` | `-f` | Filter results to a specific folder | — |
| `--tag <tag>` | `-t` | Filter results to a specific tag | — |
| `--store <path>` | — | Path to a custom bookmark store file | — |

## Examples

### Show the 10 most recent bookmarks (default)

```bash
shelf top
```

### Show the 5 most recently added bookmarks

```bash
shelf top -n 5
```

### Show recent bookmarks in the `work` folder

```bash
shelf top --folder work
```

### Show recent bookmarks tagged `typescript`

```bash
shelf top --tag typescript
```

### Combine folder and tag filters

```bash
shelf top -n 3 --folder work --tag typescript
```

## Output

Each bookmark is displayed with its rank, name, optional folder, optional tags, and URL:

```
Top 3 bookmark(s):

1. Shelf CLI Docs (work) [typescript, cli]
   https://github.com/example/shelf-cli
2. TypeScript Handbook [typescript]
   https://www.typescriptlang.org/docs/
3. Commander.js
   https://github.com/tj/commander.js
```

## Notes

- Bookmarks are sorted by the `createdAt` timestamp in descending order.
- Bookmarks without a `createdAt` value are treated as oldest.
- Filtering by folder is case-insensitive.
- Filtering by tag is case-insensitive.
