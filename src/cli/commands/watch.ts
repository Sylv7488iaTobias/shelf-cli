import { Command } from "commander";
import * as fs from "fs";
import * as path from "path";
import { getStorePath, loadStore } from "../../store/bookmarkStore";
import { formatBookmark } from "./recent";

type WatchEvent = "added" | "removed" | "modified";

interface WatchChange {
  event: WatchEvent;
  bookmark: { id: string; url: string; title?: string };
}

function diffStores(
  prev: ReturnType<typeof loadStore>,
  next: ReturnType<typeof loadStore>
): WatchChange[] {
  const changes: WatchChange[] = [];
  const prevMap = new Map(prev.bookmarks.map((b) => [b.id, b]));
  const nextMap = new Map(next.bookmarks.map((b) => [b.id, b]));

  for (const [id, bookmark] of nextMap) {
    if (!prevMap.has(id)) {
      changes.push({ event: "added", bookmark });
    } else {
      const p = prevMap.get(id)!;
      if (p.url !== bookmark.url || p.title !== bookmark.title) {
        changes.push({ event: "modified", bookmark });
      }
    }
  }

  for (const [id, bookmark] of prevMap) {
    if (!nextMap.has(id)) {
      changes.push({ event: "removed", bookmark });
    }
  }

  return changes;
}

function formatChange(change: WatchChange): string {
  const icon =
    change.event === "added" ? "✚" : change.event === "removed" ? "✖" : "✎";
  const label = change.event.toUpperCase().padEnd(8);
  return `${icon} [${label}] ${change.bookmark.url}${
    change.bookmark.title ? ` — ${change.bookmark.title}` : ""
  }`;
}

export function registerWatchCommand(program: Command): void {
  program
    .command("watch")
    .description("Watch the bookmark store for changes and print a live diff")
    .option("-i, --interval <ms>", "polling interval in milliseconds", "1000")
    .action((opts) => {
      const storePath = getStorePath();
      if (!fs.existsSync(storePath)) {
        console.error(`Store not found at ${storePath}`);
        process.exit(1);
      }

      const interval = parseInt(opts.interval, 10);
      let previous = loadStore(storePath);
      console.log(`Watching ${storePath} every ${interval}ms… (Ctrl+C to stop)`);

      const timer = setInterval(() => {
        try {
          const current = loadStore(storePath);
          const changes = diffStores(previous, current);
          if (changes.length > 0) {
            const ts = new Date().toLocaleTimeString();
            changes.forEach((c) => console.log(`[${ts}] ${formatChange(c)}`));
          }
          previous = current;
        } catch {
          // store may be mid-write; retry next tick
        }
      }, interval);

      process.on("SIGINT", () => {
        clearInterval(timer);
        console.log("\nStopped watching.");
        process.exit(0);
      });
    });
}
