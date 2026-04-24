import { Command } from "commander";
import { loadStore, saveStore, addBookmark } from "../../store/bookmarkStore";
import { Bookmark } from "../../store/bookmarkStore";

export interface BookmarkTemplate {
  name: string;
  tags: string[];
  folder?: string;
  description?: string;
}

const BUILT_IN_TEMPLATES: Record<string, BookmarkTemplate> = {
  article: { name: "article", tags: ["article", "reading"], folder: "reading" },
  video: { name: "video", tags: ["video", "watch"], folder: "media" },
  tool: { name: "tool", tags: ["tool", "dev"], folder: "tools" },
  reference: { name: "reference", tags: ["reference", "docs"], folder: "reference" },
};

export function applyTemplate(template: BookmarkTemplate, url: string, title?: string): Partial<Bookmark> {
  return {
    url,
    title: title ?? url,
    tags: [...template.tags],
    folder: template.folder,
    description: template.description ?? "",
  };
}

export function listTemplates(): BookmarkTemplate[] {
  return Object.values(BUILT_IN_TEMPLATES);
}

export function registerTemplateCommand(program: Command, storePath: string): void {
  const template = program
    .command("template")
    .description("Add a bookmark using a predefined template");

  template
    .command("list")
    .description("List available templates")
    .action(() => {
      const templates = listTemplates();
      if (templates.length === 0) {
        console.log("No templates available.");
        return;
      }
      templates.forEach((t) => {
        const tags = t.tags.join(", ");
        const folder = t.folder ? ` [folder: ${t.folder}]` : "";
        console.log(`  ${t.name.padEnd(12)} tags: ${tags}${folder}`);
      });
    });

  template
    .command("use <templateName> <url>")
    .description("Add a bookmark using a named template")
    .option("-t, --title <title>", "Override the bookmark title")
    .action((templateName: string, url: string, opts: { title?: string }) => {
      const tmpl = BUILT_IN_TEMPLATES[templateName];
      if (!tmpl) {
        console.error(`Unknown template: "${templateName}". Run 'template list' to see available templates.`);
        process.exit(1);
      }
      const partial = applyTemplate(tmpl, url, opts.title);
      const store = loadStore(storePath);
      const bookmark = addBookmark(store, partial as Bookmark);
      saveStore(storePath, store);
      console.log(`Added bookmark "${bookmark.title}" using template "${templateName}".`);
    });
}
