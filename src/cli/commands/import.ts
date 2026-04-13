import { Command } from "commander";
import * as fs from "fs";
import * as path from "path";
import { addBookmark, loadStore, saveStore } from "../../store/bookmarkStore";

interface ImportResult {
  added: number;
  skipped: number;
  errors: string[];
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (const char of line) {
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

export function importFromCSV(filePath: string, storePath: string): ImportResult {
  const result: ImportResult = { added: 0, skipped: 0, errors: [] };
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n").filter((l) => l.trim().length > 0);

  // Skip header row if present
  const startIndex = lines[0]?.toLowerCase().includes("url") ? 1 : 0;

  for (let i = startIndex; i < lines.length; i++) {
    const parts = parseCSVLine(lines[i]);
    const url = parts[0];
    const title = parts[1] || "";
    const tagsRaw = parts[2] || "";
    const tags = tagsRaw ? tagsRaw.split(";").map((t) => t.trim()).filter(Boolean) : [];

    if (!url || !url.startsWith("http")) {
      result.errors.push(`Line ${i + 1}: invalid or missing URL "${url}"`);
      continue;
    }

    const store = loadStore(storePath);
    const exists = store.bookmarks.some((b) => b.url === url);
    if (exists) {
      result.skipped++;
      continue;
    }

    addBookmark(storePath, { url, title, tags });
    result.added++;
  }

  return result;
}

export function registerImportCommand(program: Command): void {
  program
    .command("import <file>")
    .description("Import bookmarks from a CSV file (columns: url, title, tags)")
    .option("-s, --store <path>", "path to bookmark store")
    .action((file: string, options: { store?: string }) => {
      const resolvedFile = path.resolve(file);
      if (!fs.existsSync(resolvedFile)) {
        console.error(`Error: file not found: ${resolvedFile}`);
        process.exit(1);
      }

      const storePath = options.store;
      const result = importFromCSV(resolvedFile, storePath as string);

      console.log(`Import complete: ${result.added} added, ${result.skipped} skipped.`);
      if (result.errors.length > 0) {
        console.warn("Warnings:");
        result.errors.forEach((e) => console.warn(` - ${e}`));
      }
    });
}
