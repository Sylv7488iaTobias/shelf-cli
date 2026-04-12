# shelf-cli

> A terminal-based bookmark manager that syncs across machines via a lightweight git-backed store.

---

## Installation

```bash
npm install -g shelf-cli
```

Or with pnpm:

```bash
pnpm add -g shelf-cli
```

---

## Usage

```bash
# Add a bookmark
shelf add https://example.com --tags dev,tools --note "Useful reference"

# List all bookmarks
shelf list

# Search by tag or keyword
shelf search dev

# Sync with your remote git store
shelf sync

# Remove a bookmark
shelf remove https://example.com
```

On first run, `shelf init` will walk you through connecting a git repository as your backing store. Bookmarks are stored as a simple JSON file committed and pushed automatically on every change.

---

## Configuration

Config lives at `~/.shelf/config.json`. You can set your remote repo URL, default tags, and editor preference there, or run:

```bash
shelf config set remote https://github.com/yourname/shelf-store.git
```

---

## Requirements

- Node.js >= 18
- Git installed and available in your `PATH`

---

## License

MIT © [shelf-cli contributors](https://github.com/yourname/shelf-cli)