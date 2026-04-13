# `notes` Command

Attach, view, or remove free-form notes on any bookmark.

## Usage

```
shelf notes <name> [options]
```

## Arguments

| Argument | Description                        |
|----------|------------------------------------|
| `name`   | The name of the bookmark to target |

## Options

| Flag              | Description                          |
|-------------------|--------------------------------------|
| `-s, --set <note>`| Set or replace the note text         |
| `-c, --clear`     | Remove the note from the bookmark    |

## Examples

### View a note

```
shelf notes github
# Notes for "github":
# Great resource for open source projects.
```

### Set a note

```
shelf notes github --set " resource for open source projects."
# Notes updated for "github".
```

### Clear a note

```
shelf notes github --clear
# Notes cleared for "github".
```

## Notes

- Notes are stored inside the bookmark JSON store alongside other fields.
- Notes survive sync operations and are committed to git like any other change.
- Use `shelf edit` if you need to update the URL or tags at the same time.
