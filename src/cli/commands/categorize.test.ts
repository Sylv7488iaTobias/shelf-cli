import { Command } from "commander";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { inferCategory, registerCategorizeCommand } from "./categorize";

function makeTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "shelf-categorize-"));
}

function makeProgram(): Command {
  const program = new Command();
  program.exitOverride();
  registerCategorizeCommand(program);
  return program;
}

function makeStore(bookmarks: object[]) {
  return JSON.stringify({ bookmarks });
}

describe("inferCategory", () => {
  it("detects code repos", () => {
    expect(inferCategory({ url: "https://github.com/user/repo" } as any)).toBe("code");
  });

  it("detects video sites", () => {
    expect(inferCategory({ url: "https://www.youtube.com/watch?v=abc" } as any)).toBe("video");
  });

  it("detects blog posts", () => {
    expect(inferCategory({ url: "https://medium.com/some-post" } as any)).toBe("blog");
  });

  it("detects social media", () => {
    expect(inferCategory({ url: "https://twitter.com/user" } as any)).toBe("social");
  });

  it("detects documentation by title", () => {
    expect(inferCategory({ url: "https://example.com", title: "API Documentation" } as any)).toBe("docs");
  });

  it("detects research papers", () => {
    expect(inferCategory({ url: "https://arxiv.org/abs/1234" } as any)).toBe("research");
  });

  it("falls back to misc", () => {
    expect(inferCategory({ url: "https://example.com", title: "My Page" } as any)).toBe("misc");
  });
});

describe("categorize command", () => {
  it("assigns categories and saves store", async () => {
    const dir = makeTempDir();
    const storePath = path.join(dir, "bookmarks.json");
    fs.writeFileSync(
      storePath,
      makeStore([
        { id: "1", url: "https://github.com/foo/bar", title: "Repo", tags: [] },
        { id: "2", url: "https://youtube.com/watch?v=x", title: "Video", tags: [] },
      ])
    );

    const program = makeProgram();
    await program.parseAsync(["node", "test", "categorize", "--store", storePath]);

    const result = JSON.parse(fs.readFileSync(storePath, "utf-8"));
    expect(result.bookmarks[0].category).toBe("code");
    expect(result.bookmarks[1].category).toBe("video");
  });

  it("does not overwrite existing categories by default", async () => {
    const dir = makeTempDir();
    const storePath = path.join(dir, "bookmarks.json");
    fs.writeFileSync(
      storePath,
      makeStore([
        { id: "1", url: "https://github.com/foo/bar", title: "Repo", tags: [], category: "custom" },
      ])
    );

    const program = makeProgram();
    await program.parseAsync(["node", "test", "categorize", "--store", storePath]);

    const result = JSON.parse(fs.readFileSync(storePath, "utf-8"));
    expect(result.bookmarks[0].category).toBe("custom");
  });

  it("overwrites with --overwrite flag", async () => {
    const dir = makeTempDir();
    const storePath = path.join(dir, "bookmarks.json");
    fs.writeFileSync(
      storePath,
      makeStore([
        { id: "1", url: "https://github.com/foo/bar", title: "Repo", tags: [], category: "custom" },
      ])
    );

    const program = makeProgram();
    await program.parseAsync(["node", "test", "categorize", "--store", storePath, "--overwrite"]);

    const result = JSON.parse(fs.readFileSync(storePath, "utf-8"));
    expect(result.bookmarks[0].category).toBe("code");
  });
});
