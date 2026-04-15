# `rename` Command

Rename an existing bookmark by its current name.

## Usage

```
shelf rename <oldName> <newName> [options]
```

## Arguments

| Argument   | Description                         |
|------------|-------------------------------------|
| `oldName`  | The current name of the bookmark    |
| `newName`  | The new name to assign              |

## Options

| Flag              | Description                              |
|-------------------|------------------------------------------|
| `-s, --store <path>` | Path to a custom bookmark store file |

## Examples

### Basic rename

```bash
shelf rename GitHub GH
```

Renames the bookmark `GitHub` to `GH`.

### Case-insensitive lookup

The lookup for `<oldName>` is case-insensitive, so:

```bash
shelf rename github MyGitHub
```

Will match a bookmark named `github`, `GitHub`, or `GITHUB` and rename it to `MyGitHub`.

## Error Cases

- **Bookmark not found**: Exits with an error if no bookmark matches `<oldName>`.
- **Name conflict**: Exits with an error if a bookmark named `<newName>` already exists.

## Notes

- The rename operation preserves all other bookmark fields (URL, tags, folder, pinned status, etc.).
- After renaming, you may want to run `shelf sync` to push the change to your remote store.
