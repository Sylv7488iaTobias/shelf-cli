# `shelf preview`

Fetch and display a live page preview for a saved bookmark.

## Usage

```
shelf preview <name> [options]
```

## Arguments

| Argument | Description                        |
|----------|------------------------------------|
| `name`   | The name of the bookmark to preview |

## Options

| Flag              | Description                        |
|-------------------|---------------------------------|
| `-s, --store <path>` | Path to a custom bookmark store |

## Description

The `preview` command fetches the live webpage for the given bookmark and
extracts the page's `<title>` tag and `<meta name="description">` content,
displaying them in the terminal.

This is useful for quickly verifying that a saved URL is still valid and
checking what the page currently looks like without opening a browser.

## Example

```
$ shelf preview my-blog
Fetching preview for: https://myblog.example.com

Title      : My Personal Blog
Description: Thoughts on software, life, and coffee.
URL        : https://myblog.example.com
```

## Error Handling

- If the bookmark name is not found, an error is printed and the process exits with code `1`.
- If the HTTP request fails (network error, timeout, etc.), the error message is printed and the process exits with code `1`.
