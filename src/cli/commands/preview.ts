import { Command } from "commander";
import fetch from "node-fetch";
import { loadStore } from "../../store/bookmarkStore";

export interface PagePreview {
  title: string;
  description: string;
  url: string;
}

/**
 * Fetches and parses basic page metadata (title and description) from a given URL.
 * Extracts content from <title> and <meta name="description"> tags.
 *
 * @param url - The URL of the page to preview
 * @returns A PagePreview object containing title, description, and url
 * @throws If the HTTP request fails or times out
 */
export async function fetchPreview(url: string): Promise<PagePreview> {
  const res = await fetch(url, { timeout: 5000 } as any);

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${res.statusText}`);
  }

  const html = await res.text();

  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const descMatch =
    html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i) ||
    html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i);

  return {
    title: titleMatch ? titleMatch[1].trim() : "(no title)",
    description: descMatch ? descMatch[1].trim() : "(no description)",
    url,
  };
}

export function registerPreviewCommand(program: Command): void {
  program
    .command("preview <name>")
    .description("Fetch and display a preview of a bookmark's page metadata")
    .option("-s, --store <path>", "Path to bookmark store")
    .action(async (name: string, options: { store?: string }) => {
      const store = loadStore(options.store);
      const bookmark = store.bookmarks.find((b) => b.name === name);

      if (!bookmark) {
        console.error(`Bookmark "${name}" not found.`);
        process.exit(1);
      }

      console.log(`Fetching preview for: ${bookmark.url}`);

      try {
        const preview = await fetchPreview(bookmark.url);
        console.log(`\nTitle      : ${preview.title}`);
        console.log(`Description: ${preview.description}`);
        console.log(`URL        : ${preview.url}`);
      } catch (err: any) {
        console.error(`Failed to fetch preview: ${err.message}`);
        process.exit(1);
      }
    });
}
