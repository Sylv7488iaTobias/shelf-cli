# `shelf watch`

Watch the bookmark store for live changes and print a real-time diff to the terminal.

## Usage

```
shelf watch [options]
```

## Options

| Flag | Default | Description |
|------|---------|-------------|
| `-i, --interval <ms>` | `1000` | Polling interval in milliseconds |

## Description

`shelf watch` polls the bookmark store file at a configurable interval and prints a
line whenever a bookmark is **added**, **removed**, or **modified** (URL or title changed).

Each line is prefixed with a timestamp and a change-type icon:

- `✚ [ADDED   ]` — a new bookmark appeared
- `✖ [REMOVED ]` — a bookmark was deleted
- `✎ [MODIFIED]` — a bookmark's URL or title changed

Press **Ctrl+C** to stop watching.

## Examples

```bash
# Watch with default 1-second polling
shelf watch

# Watch with faster 500 ms polling
shelf watch --interval 500
```

## Notes

- The watcher uses file polling (not `inotify`/`FSEvents`) for cross-platform
  compatibility and to work correctly over network-mounted drives.
- If the store file is temporarily unreadable (e.g. mid-write during a sync),
  the watcher silently skips that tick and retries on the next interval.
- Works well alongside `shelf sync` running in a separate terminal to observe
  changes arriving from remote machines in real time.
