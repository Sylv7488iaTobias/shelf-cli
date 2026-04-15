# `group` Command

The `group` command lets you organise and manage bookmarks by their folder (group).

## Subcommands

### `shelf group list`

List all groups (folders) with a count of bookmarks in each.

```
shelf group list
```

**Output example:**
```
(none) (3)
personal (5)
work (12)
```

---

### `shelf group show <folder>`

Display all bookmarks inside a specific group.

```
shelf group show work
```

Use `none` as the folder name to show ungrouped bookmarks:

```
shelf group show none
```

**Output example:**
```
[abc123] GitHub — https://github.com
[def456] Jira — https://jira.example.com
```

---

### `shelf group move <folder> <newFolder>`

Rename a group by moving all bookmarks from one folder name to another.

```
shelf group move work office
```

**Output example:**
```
Moved 12 bookmark(s) from "work" to "office".
```

---

## Options

| Flag | Description |
|------|-------------|
| `-s, --store <path>` | Path to bookmark store file (overrides default) |

## Notes

- Folders are derived from the `folder` field on each bookmark.
- Bookmarks without a folder are shown under the group name `(none)`.
- Use `shelf move` to change the folder of a single bookmark.
