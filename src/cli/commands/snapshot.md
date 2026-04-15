# `snapshot` and `snapshots` Commands

## Overview

The `snapshot` command saves a point-in-time copy of your bookmark store to a JSON file. The `snapshots` command lists all previously saved snapshots.

Snapshots are independent of the git-backed sync — they are plain JSON files you can store anywhere.

---

## `shelf snapshot`

Save the current bookmarks to a snapshot file.

### Usage

```bash
shelf snapshot [options]
```

### Options

| Flag | Description | Default |
|------|-------------|---------|
| `-o, --output <dir>` | Directory to write the snapshot | current directory |
| `-n, --name <name>` | Custom filename (without `.json`) | auto-generated timestamp |
| `--store <path>` | Path to the bookmark store | default store path |

### Examples

```bash
# Auto-named snapshot in current directory
shelf snapshot

# Custom name and output directory
shelf snapshot --name before-cleanup --output ~/shelf-snapshots
```

### Output Format

The snapshot file is a JSON object:

```json
{
  "createdAt": "2024-06-15T14:32:00.000Z",
  "total": 42,
  "bookmarks": [ ... ]
}
```

---

## `shelf snapshots`

List all snapshot files in a directory.

### Usage

```bash
shelf snapshots [options]
```

### Options

| Flag | Description | Default |
|------|-------------|---------|
| `-d, --dir <path>` | Directory to scan for snapshots | current directory |
| `--json` | Output results as JSON | false |

### Examples

```bash
# List snapshots in default location
shelf snapshots --dir ~/shelf-snapshots

# Machine-readable output
shelf snapshots --dir ~/shelf-snapshots --json
```
