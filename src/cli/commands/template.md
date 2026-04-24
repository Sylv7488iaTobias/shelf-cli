# `template` Command

The `template` command lets you quickly add bookmarks using predefined templates. Templates pre-fill tags, folders, and other metadata so you can stay consistent without typing the same values repeatedly.

## Usage

```
shelf template list
shelf template use <templateName> <url> [options]
```

## Subcommands

### `template list`

Lists all available built-in templates.

```
shelf template list
```

**Example output:**
```
  article      tags: article, reading [folder: reading]
  video        tags: video, watch [folder: media]
  tool         tags: tool, dev [folder: tools]
  reference    tags: reference, docs [folder: reference]
```

---

### `template use <templateName> <url>`

Adds a bookmark using the specified template.

```
shelf template use article https://example.com/post
shelf template use tool https://github.com/some/tool --title "Some Tool"
```

**Options:**

| Flag | Description |
|------|-------------|
| `-t, --title <title>` | Override the default title (defaults to the URL) |

---

## Built-in Templates

| Name      | Tags                   | Folder    |
|-----------|------------------------|-----------|
| article   | article, reading       | reading   |
| video     | video, watch           | media     |
| tool      | tool, dev              | tools     |
| reference | reference, docs        | reference |

## Notes

- Tags from the template are applied automatically and can be adjusted later with `shelf tag`.
- The `--title` flag is optional; if omitted, the URL is used as the title.
- Templates are currently built-in. Custom template support may be added in a future release.
