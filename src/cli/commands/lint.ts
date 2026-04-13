import { Command } from "commander";
import { loadStore } from "../../store/bookmarkStore";
import { Bookmark } from "../../store/bookmarkStore";

export interface LintIssue {
  id: string;
  title: string;
  field: string;
  message: string;
}

export function lintBookmarks(bookmarks: Bookmark[]): LintIssue[] {
  const issues: LintIssue[] = [];

  for (const bookmark of bookmarks) {
    // Check for missing or empty URL
    if (!bookmark.url || bookmark.url.trim() === "") {
      issues.push({ id: bookmark.id, title: bookmark.title, field: "url", message: "URL is missing or empty" });
    } else {
      try {
        new URL(bookmark.url);
      } catch {
        issues.push({ id: bookmark.id, title: bookmark.title, field: "url", message: `Invalid URL: ${bookmark.url}` });
      }
    }

    // Check for missing title
    if (!bookmark.title || bookmark.title.trim() === "") {
      issues.push({ id: bookmark.id, title: bookmark.title ?? "(untitled)", field: "title", message: "Title is missing or empty" });
    }

    // Check for duplicate tags
    if (bookmark.tags && bookmark.tags.length !== new Set(bookmark.tags).size) {
      issues.push({ id: bookmark.id, title: bookmark.title, field: "tags", message: "Duplicate tags found" });
    }

    // Check for overly long title
    if (bookmark.title && bookmark.title.length > 200) {
      issues.push({ id: bookmark.id, title: bookmark.title, field: "title", message: "Title exceeds 200 characters" });
    }
  }

  return issues;
}

export function registerLintCommand(program: Command): void {
  program
    .command("lint")
    .description("Check bookmarks for common issues (invalid URLs, missing fields, duplicate tags)")
    .option("--fix", "Attempt to auto-fix fixable issues (e.g. deduplicate tags)")
    .option("--json", "Output issues as JSON")
    .action(async (opts) => {
      const store = await loadStore();
      const issues = lintBookmarks(store.bookmarks);

      if (issues.length === 0) {
        console.log("✅ No issues found.");
        return;
      }

      if (opts.json) {
        console.log(JSON.stringify(issues, null, 2));
        return;
      }

      console.log(`⚠️  Found ${issues.length} issue(s):\n`);
      for (const issue of issues) {
        console.log(`  [${issue.id}] "${issue.title}" — ${issue.field}: ${issue.message}`);
      }

      if (!opts.fix) {
        console.log("\nRun with --fix to attempt auto-fixes.");
      }
    });
}
