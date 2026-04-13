import { Command } from "commander";
import * as fs from "fs";
import * as path from "path";
import { loadStore, getStorePath } from "../../store/bookmarkStore";
import { Bookmark } from "../../store/bookmarkStore";

type ExportFormat = "json" | "csv" | "markdown";

function toCSV(bookmarks: Bookmark[]): string {
  const header = "id,title,url,tags,createdAt";
  const rows = bookmarks.map((b) =>
    `${b.id},"${b.title}",${b.url},"${b.tags.join(";")}",${b.createdAt}`
  );
  return [header, ...rows].join("\n");
}

function toMarkdown(bookmarks: Bookmark[]): string {
  const lines = bookmarks.map(
    (b) => `- [${b.title}](${b.url})${b.tags.length ? ` \`${b.tags.join(", ")}\`` : ""}`
  );
  return `# Bookmarks\n\n${lines.join("\n")}\n`;
}

export function registerExportCommand(program: Command): void {
  program
    .command("export")
    .description("Export bookmarks to a file")
    .argument("<output>", "Output file path")
    .option("-f, --format <format>", "Export format: json, csv, markdown", "json")
    .action((output: string, options: { format: ExportFormat }) => {
      try {
        const storePath = getStorePath();
        const store = loadStore(storePath);
        const { bookmarks } = store;
        const format = options.format as ExportFormat;

        let content: string;
        switch (format) {
          case "csv":
            content = toCSV(bookmarks);
            break;
          case "markdown":
            content = toMarkdown(bookmarks);
            break;
          case "json":
          default:
            content = JSON.stringify({ bookmarks }, null, 2);
        }

        const resolvedPath = path.resolve(output);
        fs.writeFileSync(resolvedPath, content, "utf-8");
        console.log(`Exported ${bookmarks.length} bookmark(s) to ${resolvedPath} [${format}]`);
      } catch (err) {
        console.error("Export failed:", (err as Error).message);
        process.exit(1);
      }
    });
}
