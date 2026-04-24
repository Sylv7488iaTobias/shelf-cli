import { Command } from "commander";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { computeScore } from "./score";
import { registerScoreCommand } from "./score";
import { saveStore } from "../../store/bookmarkStore";

function makeProgram(storePath: string): Command {
  const program = new Command();
  program.exitOverride();
  registerScoreCommand(program);
  return program;
}

function makeTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "shelf-score-"));
}

function makeBookmark(overrides: Record<string, unknown> = {}) {
  return {
    id: "abc123",
    title: "Test Bookmark",
    url: "https://example.com",
    tags: [],
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

describe("computeScore", () => {
  it("returns 0 for a bare bookmark", () => {
    expect(computeScore(makeBookmark() as any)).toBe(0);
  });

  it("adds points for rating", () => {
    const b = makeBookmark({ rating: 5 }) as any;
    expect(computeScore(b)).toBeGreaterThanOrEqual(50);
  });

  it("adds points for pinned", () => {
    const b = makeBookmark({ pinned: true }) as any;
    expect(computeScore(b)).toBe(15);
  });

  it("adds points for favorite", () => {
    const b = makeBookmark({ favorite: true }) as any;
    expect(computeScore(b)).toBe(10);
  });

  it("adds points for notes", () => {
    const b = makeBookmark({ notes: "some notes" }) as any;
    expect(computeScore(b)).toBe(5);
  });

  it("penalises archived bookmarks", () => {
    const b = makeBookmark({ archived: true, rating: 1 }) as any;
    expect(computeScore(b)).toBe(0); // 10 - 20 clamped to 0
  });

  it("adds tag richness bonus up to 10", () => {
    const b = makeBookmark({ tags: ["a", "b", "c", "d", "e", "f"] }) as any;
    expect(computeScore(b)).toBe(10);
  });

  it("adds recency boost for recent visit", () => {
    const b = makeBookmark({
      lastVisited: new Date().toISOString(),
    }) as any;
    expect(computeScore(b)).toBeGreaterThan(0);
  });
});

describe("score command", () => {
  it("prints top bookmarks by score", async () => {
    const dir = makeTempDir();
    const storePath = path.join(dir, "bookmarks.json");
    await saveStore(
      {
        bookmarks: [
          makeBookmark({ id: "1", title: "Pinned One", pinned: true }),
          makeBookmark({ id: "2", title: "Plain One" }),
        ],
      } as any,
      storePath
    );

    const spy = jest.spyOn(console, "log").mockImplementation(() => {});
    const program = makeProgram(storePath);
    await program.parseAsync(["node", "shelf", "score", "--store", storePath]);
    const output = spy.mock.calls.map((c) => c[0]).join("\n");
    expect(output).toContain("Pinned One");
    spy.mockRestore();
  });

  it("filters by query", async () => {
    const dir = makeTempDir();
    const storePath = path.join(dir, "bookmarks.json");
    await saveStore(
      {
        bookmarks: [
          makeBookmark({ id: "1", title: "TypeScript Guide", pinned: true }),
          makeBookmark({ id: "2", title: "Cooking Recipes" }),
        ],
      } as any,
      storePath
    );

    const spy = jest.spyOn(console, "log").mockImplementation(() => {});
    const program = makeProgram(storePath);
    await program.parseAsync([
      "node",
      "shelf",
      "score",
      "typescript",
      "--store",
      storePath,
    ]);
    const output = spy.mock.calls.map((c) => c[0]).join("\n");
    expect(output).toContain("TypeScript Guide");
    expect(output).not.toContain("Cooking");
    spy.mockRestore();
  });
});
