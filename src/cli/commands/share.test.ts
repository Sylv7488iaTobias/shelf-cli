import { Command } from "commander";
import { formatAsMarkdownLink, formatAsPlainLink, formatAsJSON, registerShareCommand } from "./share";
import { saveStore } from "../../store/bookmarkStore";
import * as os from "os";
import * as path from "path";
import * as fs from "fs";

function makeTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "shelf-share-test-"));
}

function makeProgram(storePath: string): Command {
  const program = new Command();
  program.exitOverride();
  registerShareCommand(program);
  return program;
}

const sampleBookmark = {
  name: "GitHub",
  url: "https://github.com",
  tags: ["dev", "code"],
  createdAt: new Date().toISOString(),
};

describe("formatAsMarkdownLink", () => {
  it("formats with tags", () => {
    expect(formatAsMarkdownLink(sampleBookmark as any)).toBe("[GitHub](https://github.com) (dev, code)");
  });

  it("formats without tags", () => {
    const b = { ...sampleBookmark, tags: [] };
    expect(formatAsMarkdownLink(b as any)).toBe("[GitHub](https://github.com)");
  });
});

describe("formatAsPlainLink", () => {
  it("formats as plain text", () => {
    expect(formatAsPlainLink(sampleBookmark as any)).toBe("GitHub: https://github.com");
  });
});

describe("formatAsJSON", () => {
  it("returns valid JSON", () => {
    const result = formatAsJSON(sampleBookmark as any);
    const parsed = JSON.parse(result);
    expect(parsed.name).toBe("GitHub");
    expect(parsed.url).toBe("https://github.com");
    expect(parsed.tags).toEqual(["dev", "code"]);
  });
});

describe("share command", () => {
  let tmpDir: string;
  let storePath: string;

  beforeEach(() => {
    tmpDir = makeTempDir();
    storePath = path.join(tmpDir, "bookmarks.json");
    saveStore(storePath, { bookmarks: [sampleBookmark as any] });
  });

  it("outputs plain format by default", () => {
    const program = makeProgram(storePath);
    const spy = jest.spyOn(console, "log").mockImplementation(() => {});
    program.parse(["node", "shelf", "share", "GitHub", "--store", storePath]);
    expect(spy).toHaveBeenCalledWith("GitHub: https://github.com");
    spy.mockRestore();
  });

  it("outputs markdown format", () => {
    const program = makeProgram(storePath);
    const spy = jest.spyOn(console, "log").mockImplementation(() => {});
    program.parse(["node", "shelf", "share", "GitHub", "--format", "markdown", "--store", storePath]);
    expect(spy).toHaveBeenCalledWith("[GitHub](https://github.com) (dev, code)");
    spy.mockRestore();
  });

  it("exits with error for unknown bookmark", () => {
    const program = makeProgram(storePath);
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    const exitSpy = jest.spyOn(process, "exit").mockImplementation(() => { throw new Error("exit"); });
    expect(() =>
      program.parse(["node", "shelf", "share", "NotExist", "--store", storePath])
    ).toThrow();
    expect(spy).toHaveBeenCalledWith(expect.stringContaining("not found"));
    spy.mockRestore();
    exitSpy.mockRestore();
  });
});
