# `shelf backup` & `shelf restore`

Create and restore timestamped snapshots of your bookmark store.

---

## `shelf backup`

Creates a JSON snapshot of your current bookmark store.

### Usage

```
shelf backup [options]
```

### Options

| Flag | Description | Default |
|------|-------------|---------|
| `-o, --output <dir>` | Directory to write the backup file | `.` (current directory) |
| `--list` | List existing backups in the output directory | — |

### Examples

```bash
# Create a backup in the current directory
shelf backup

# Create a backup in a specific folder
shelf backup --output ~/shelf-backups

# List all backups in a folder
shelf backup --output ~/shelf-backups --list
```

Backup files are named with a timestamp, e.g. `shelf-backup-2024-06-15_10-30-00.json`.

---

## `shelf restore <file>`

Restores bookmarks from a previously created backup file.

### Usage

```
shelf restore <file> [options]
```

### Options

| Flag | Description |
|------|-------------|
| `--dry-run` | Preview what would be restored without making changes |
| `--merge` | Add bookmarks from the backup without replacing existing ones (skips duplicate URLs) |

### Examples

```bash
# Fully restore from a backup (replaces current store)
shelf restore ~/shelf-backups/shelf-backup-2024-06-15_10-30-00.json

# Preview a restore
shelf restore backup.json --dry-run

# Merge backup into existing bookmarks
shelf restore backup.json --merge
```

> **Warning:** Without `--merge`, restore will overwrite your current bookmark store.
