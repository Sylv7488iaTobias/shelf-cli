import { Command } from "commander";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { applyTemplate, listTemplates, registerTemplateCommand } from "./template";
import { saveStore } from "../../store/bookmarkStore";

function makeTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "shelf-template-test-"));
}

function makeStorePath(dir: string): string {
  const p = path.join(dir, "bookmarks.json");
  saveStore(p, { bookmarks: [] });
  return p;
}

function makeProgram(storePath: string): Command {
  const program = new Command();
  program.exitOverride();
  registerTemplateCommand(program, storePath);
  return program;
}

describe("applyTemplate", () => {
  it("applies tags and folder from template", () => {
    const result = applyTemplate(
      { name: "article", tags: ["article", "reading"], folder: "reading" },
      "https://example.com",
      "My Article"
    );
    expect(result.url).toBe("https://example.com");
    expect(result.title).toBe("My Article");
    expect(result.tags).toEqual(["article", "reading"]);
    expect(result.folder).toBe("reading");
  });

  it("uses url as title when title is not provided", () => {
    const result = applyTemplate(
      { name: "tool", tags: ["tool", "dev"], folder: "tools" },
      "https://tool.dev"
    );
    expect(result.title).toBe("https://tool.dev");
  });
});

describe("listTemplates", () => {
  it("returns at least one built-in template", () => {
    const templates = listTemplates();
    expect(templates.length).toBeGreaterThan(0);
    expect(templates.some((t) => t.name === "article")).toBe(true);
  });
});

describe("template list command", () => {
  it("prints available templates", () => {
    const dir = makeTempDir();
    const storePath = makeStorePath(dir);
    const program = makeProgram(storePath);
    const spy = jest.spyOn(console, "log").mockImplementation(() => {});
    program.parse(["node", "shelf", "template", "list"]);
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});

describe("template use command", () => {
  it("adds a bookmark using a valid template", () => {
    const dir = makeTempDir();
    const storePath = makeStorePath(dir);
    const program = makeProgram(storePath);
    const spy = jest.spyOn(console, "log").mockImplementation(() => {});
    program.parse(["node", "shelf", "template", "use", "article", "https://example.com", "--title", "Test Article"]);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining("Test Article"));
    spy.mockRestore();
  });

  it("exits with error for unknown template", () => {
    const dir = makeTempDir();
    const storePath = makeStorePath(dir);
    const program = makeProgram(storePath);
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    const exitSpy = jest.spyOn(process, "exit").mockImplementation(() => { throw new Error("exit"); });
    expect(() =>
      program.parse(["node", "shelf", "template", "use", "nonexistent", "https://example.com"])
    ).toThrow();
    expect(spy).toHaveBeenCalledWith(expect.stringContaining("Unknown template"));
    spy.mockRestore();
    exitSpy.mockRestore();
  });
});
