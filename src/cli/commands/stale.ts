import { Command } from "commander";
import * as https from "https";
import * as http from "http";
import { loadStore } from "../../store/bookmarkStore";
import { Bookmark } from "../../store/bookmarkStore";

export interface StaleResult {
  bookmark: Bookmark;
  status: "unreachable" | "error";
  reason: string;
}

export function checkUrl(url: string, timeoutMs = 5000): Promise<number | null> {
  return new Promise((resolve) => {
    const client = url.startsWith("https") ? https : http;
    const req = client.get(url, { timeout: timeoutMs }, (res) => {
      resolve(res.statusCode ?? null);
      res.resume();
    });
    req.on("timeout", () => {
      req.destroy();
      resolve(null);
    });
    req.on("error", () => resolve(null));
  });
}

export async function findStaleBookmarks(
  storePath: string,
  timeoutMs = 5000
): Promise<StaleResult[]> {
  const store = loadStore(storePath);
  const results: StaleResult[] = [];

  for (const bookmark of store.bookmarks) {
    let url: string;
    try {
      url = new URL(bookmark.url).toString();
    } catch {
      results.push({ bookmark, status: "error", reason: "Invalid URL" });
      continue;
    }

    const statusCode = await checkUrl(url, timeoutMs);
    if (statusCode === null) {
      results.push({ bookmark, status: "unreachable", reason: "No response or timeout" });
    } else if (statusCode >= 400) {
      results.push({ bookmark, status: "error", reason: `HTTP ${statusCode}` });
    }
  }

  return results;
}

export function registerStaleCommand(program: Command, storePath: string): void {
  program
    .command("stale")
    .description("Check bookmarks for broken or unreachable URLs")
    .option("--timeout <ms>", "Request timeout in milliseconds", "5000")
    .action(async (opts) => {
      const timeoutMs = parseInt(opts.timeout, 10);
      console.log("Checking bookmarks for stale URLs...\n");
      const stale = await findStaleBookmarks(storePath, timeoutMs);

      if (stale.length === 0) {
        console.log("All bookmarks appear to be reachable.");
        return;
      }

      console.log(`Found ${stale.length} stale bookmark(s):\n`);
      for (const result of stale) {
        console.log(`  [${result.status.toUpperCase()}] ${result.bookmark.name}`);
        console.log(`         URL: ${result.bookmark.url}`);
        console.log(`      Reason: ${result.reason}\n`);
      }
    });
}
