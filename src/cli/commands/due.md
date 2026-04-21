# `shelf due` — Manage Due Dates on Bookmarks

The `due` command lets you assign, clear, and list due dates on your bookmarks.
This is useful for tracking deadlines, review schedules, or time-sensitive resources.

## Subcommands

### `shelf due set <id> <date>`

Assign a due date to a bookmark by its ID.

```bash
shelf due set abc123 2025-06-30
```

Dates must be in a parseable format (e.g. `YYYY-MM-DD`).

**Options:**
- `-s, --store <path>` — Path to bookmark store (defaults to configured store)

---

### `shelf due clear <id>`

Remove the due date from a bookmark.

```bash
shelf due clear abc123
```

**Options:**
- `-s, --store <path>` — Path to bookmark store

---

### `shelf due list`

List all bookmarks that have a due date, sorted by date ascending.
Overdue bookmarks are marked with a ⚠ indicator.

```bash
shelf due list
```

To show only overdue bookmarks:

```bash
shelf due list --overdue
```

**Options:**
- `-s, --store <path>` — Path to bookmark store
- `--overdue` — Filter to only overdue bookmarks

---

## Example Output

```
[abc123] Read This Article <https://example.com>  due: 6/30/2025
[def456] Overdue Task <https://old.com>  due: 1/1/2023 ⚠ OVERDUE
```

## Notes

- Due dates are stored as ISO 8601 strings in the bookmark store.
- Use `shelf remind` for notification-based reminders tied to due dates.
