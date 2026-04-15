# `shelf filter` — Filter Bookmarks by Metadata

Filter your bookmarks by one or more metadata attributes such as folder, pinned state, archived status, favorites, or presence of notes.

## Usage

```
shelf filter [options]
```

## Options

| Option | Description |
|---|---|
| `--folder <folder>` | Show only bookmarks in the given folder |
| `--pinned` | Show only pinned bookmarks |
| `--no-pinned` | Exclude pinned bookmarks |
| `--archived` | Show only archived bookmarks |
| `--favorite` | Show only favorite bookmarks |
| `--has-notes` | Show only bookmarks that have notes |
| `--json` | Output results as JSON |

## Examples

### Show all bookmarks in the "work" folder

```
shelf filter --folder work
```

### Show pinned bookmarks

```
shelf filter --pinned
```

### Show archived favorites

```
shelf filter --archived --favorite
```

### Show bookmarks with notes in JSON format

```
shelf filter --has-notes --json
```

### Exclude pinned bookmarks

```
shelf filter --no-pinned
```

## Output

By default, each matching bookmark is printed in the format:

```
[folder] name: url 📌 ⭐ 📝
```

Emoji flags indicate: 📌 pinned, 📦 archived, ⭐ favorite, 📝 has notes.

Use `--json` to get structured output suitable for scripting.
