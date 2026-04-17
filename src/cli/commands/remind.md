# `remind` — Bookmark Reminders

Set and review date-based reminders on bookmarks.

## Commands

### `shelf remind <name> <date>`

Attach a reminder date (ISO `YYYY-MM-DD`) to a bookmark.

```bash
shelf remind github 2024-12-31
# Reminder set for "github" on 2024-12-31.
```

**Arguments**

| Argument | Description |
|----------|-------------|
| `name`   | Bookmark name |
| `date`   | ISO date string (`YYYY-MM-DD`) |

**Options**

| Flag | Description |
|------|-------------|
| `-s, --store <path>` | Custom store path |

---

### `shelf reminders`

List all bookmarks that have a reminder set, sorted by date.

```bash
shelf reminders
# [upcoming] 2024-12-31  github  https://github.com
# [OVERDUE]  2023-01-01  docs    https://docs.example.com
```

**Options**

| Flag | Description |
|------|-------------|
| `--overdue` | Show only reminders whose date is in the past |
| `-s, --store <path>` | Custom store path |

## Notes

- Reminder dates are stored as an ISO string in the `remindAt` field of each bookmark.
- No notification system is included; pair with cron / launchd for alerts.
- Remove a reminder by editing the store directly or via `shelf edit`.
