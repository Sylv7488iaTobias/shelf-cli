import { Command } from "commander";
import { loadStore } from "../../store/bookmarkStore";
import { Bookmark } from "../../store/bookmarkStore";

export interface BrokenCheckResult {
  bookmark: Bookmark;
  status: number | null;
  error?: string;
}

async function checkBookmark(bookmark: Bookmark): Promise<BrokenCheckResult> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(bookmark.url, {
      method: "HEAD",
      signal: controller.signal,
      redirect: "follow",
    });
    clearTimeout(timeout);
    return { bookmark, status: res.status };
  } catch (err: any) {
    return { bookmark, status: null, error: err.message ?? "Unknown error" };
  }
}

function isBroken(result: BrokenCheckResult): boolean {
  if (result.error) return true;
  if (result.status === null) return true;
  return result.status >= 400;
}

export function registerBrokenCommand(program: Command): void {
  program
    .command("broken")
    .description("Check all bookmarks for broken or unreachable URLs")
    .option("-f, --folder <folder>", "Limit check to a specific folder")
    .option("-q, --quiet", "Only print broken URLs, no summary")
    .action(async (opts) => {
      const store = loadStore();
      let bookmarks = store.bookmarks;

      if (opts.folder) {
        bookmarks = bookmarks.filter((b) => b.folder === opts.folder);
      }

      if (bookmarks.length === 0) {
        console.log("No bookmarks to check.");
        return;
      }

      console.log(`Checking ${bookmarks.length} bookmark(s)...\n`);

      const results = await Promise.all(bookmarks.map(checkBookmark));
      const broken = results.filter(isBroken);

      if (broken.length === 0) {
        if (!opts.quiet) console.log("✅ All bookmarks appear to be reachable.");
        return;
      }

      for (const r of broken) {
        const label = r.status !== null ? `HTTP ${r.status}` : `Error: ${r.error}`;
        console.log(`❌ [${label}] ${r.bookmark.name} — ${r.bookmark.url}`);
      }

      if (!opts.quiet) {
        console.log(`\n${broken.length} broken bookmark(s) found out of ${bookmarks.length} checked.`);
      }
    });
}
