import { Command } from "commander";
import { loadStore } from "../../store/bookmarkStore";
import { Bookmark } from "../../store/bookmarkStore";

export interface ClusterGroup {
  label: string;
  bookmarks: Bookmark[];
}

export function clusterByDomain(bookmarks: Bookmark[]): ClusterGroup[] {
  const map = new Map<string, Bookmark[]>();

  for (const bm of bookmarks) {
    let domain = "unknown";
    try {
      const url = new URL(bm.url);
      domain = url.hostname.replace(/^www\./, "");
    } catch {
      // leave as unknown
    }
    if (!map.has(domain)) map.set(domain, []);
    map.get(domain)!.push(bm);
  }

  return Array.from(map.entries())
    .map(([label, bookmarks]) => ({ label, bookmarks }))
    .sort((a, b) => b.bookmarks.length - a.bookmarks.length);
}

export function clusterByTag(bookmarks: Bookmark[]): ClusterGroup[] {
  const map = new Map<string, Bookmark[]>();

  for (const bm of bookmarks) {
    const tags = bm.tags && bm.tags.length > 0 ? bm.tags : ["untagged"];
    for (const tag of tags) {
      if (!map.has(tag)) map.set(tag, []);
      map.get(tag)!.push(bm);
    }
  }

  return Array.from(map.entries())
    .map(([label, bookmarks]) => ({ label, bookmarks }))
    .sort((a, b) => b.bookmarks.length - a.bookmarks.length);
}

export function registerClusterCommand(program: Command): void {
  program
    .command("cluster")
    .description("Group bookmarks into clusters by domain or tag")
    .option("-b, --by <field>", "Cluster by: domain | tag", "domain")
    .option("-n, --min <count>", "Minimum cluster size to display", "1")
    .option("--store <path>", "Path to bookmark store")
    .action((opts) => {
      const store = loadStore(opts.store);
      const min = parseInt(opts.min, 10);

      const clusters =
        opts.by === "tag"
          ? clusterByTag(store.bookmarks)
          : clusterByDomain(store.bookmarks);

      const filtered = clusters.filter((c) => c.bookmarks.length >= min);

      if (filtered.length === 0) {
        console.log("No clusters found.");
        return;
      }

      for (const cluster of filtered) {
        console.log(`\n[${cluster.label}] (${cluster.bookmarks.length})`);
        for (const bm of cluster.bookmarks) {
          console.log(`  ${bm.name} — ${bm.url}`);
        }
      }
    });
}
