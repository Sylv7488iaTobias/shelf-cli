import { Command } from "commander";
import { computeTrendingScore, formatTrendingBookmark, registerTrendingCommand } from "./trending";
import { Bookmark } from "../../store/bookmarkStore";

function makeBookmark(overrides: Partial<Bookmark> = {}): Bookmark {
  return {
    id: "abc123",
    name: "Test Bookmark",
    url: "https://example.com",
    tags: [],
    addedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    visits: 10,
    archived: false,
    ...overrides,
  };
}

function makeProgram(): Command {
  const program = new Command();
  program.exitOverride();
  registerTrendingCommand(program);
  return program;
}

describe("computeTrendingScore", () => {
  const now = new Date("2024-06-01T00:00:00Z");

  it("returns higher score for more visits", () => {
    const few = makeBookmark({ visits: 1 });
    const many = makeBookmark({ visits: 100 });
    expect(computeTrendingScore(many, now)).toBeGreaterThan(computeTrendingScore(few, now));
  });

  it("returns higher score for recently visited bookmarks", () => {
    const old = makeBookmark({ visits: 5, lastVisited: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString() });
    const recent = makeBookmark({ visits: 5, lastVisited: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() });
    expect(computeTrendingScore(recent, now)).toBeGreaterThan(computeTrendingScore(old, now));
  });

  it("handles missing visits and lastVisited gracefully", () => {
    const b = makeBookmark({ visits: undefined, lastVisited: undefined });
    expect(() => computeTrendingScore(b, now)).not.toThrow();
    expect(computeTrendingScore(b, now)).toBeGreaterThanOrEqual(0);
  });

  it("penalises older bookmarks with same visits", () => {
    const fresh = makeBookmark({ visits: 10, addedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() });
    const stale = makeBookmark({ visits: 10, addedAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString() });
    expect(computeTrendingScore(fresh, now)).toBeGreaterThan(computeTrendingScore(stale, now));
  });
});

describe("formatTrendingBookmark", () => {
  it("formats bookmark with rank and score", () => {
    const b = makeBookmark({ name: "My Site", url: "https://mysite.io", tags: ["dev"] });
    const output = formatTrendingBookmark(b, 1, 3.14);
    expect(output).toContain("1.");
    expect(output).toContain("My Site");
    expect(output).toContain("3.14");
    expect(output).toContain("https://mysite.io");
    expect(output).toContain("dev");
  });

  it("omits tags section when no tags", () => {
    const b = makeBookmark({ tags: [] });
    const output = formatTrendingBookmark(b, 2, 1.0);
    expect(output).not.toContain("[");
  });
});

describe("registerTrendingCommand", () => {
  it("registers the trending command", () => {
    const program = makeProgram();
    const cmd = program.commands.find((c) => c.name() === "trending");
    expect(cmd).toBeDefined();
  });

  it("has --limit and --json options", () => {
    const program = makeProgram();
    const cmd = program.commands.find((c) => c.name() === "trending")!;
    const optNames = cmd.options.map((o) => o.long);
    expect(optNames).toContain("--limit");
    expect(optNames).toContain("--json");
    expect(optNames).toContain("--folder");
  });
});
