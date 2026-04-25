import { Command } from "commander";
import { registerSummarizeCommand } from "./summarize";
import * as bookmarkStore from "../../store/bookmarkStore";

function makeProgram() {
  const program = new Command();
  program.exitOverride();
  registerSummarizeCommand(program);
  return program;
}

function makeBookmark(overrides: Partial<bookmarkStore.Bookmark> = {}): bookmarkStore.Bookmark {
  return {
    id: Math.random().toString(36).slice(2),
    url: "https://example.com/page",
    title: "Example",
    tags: [],
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

describe("summarize command", () => {
  let spy: jest.SpyInstance;

  beforeEach(() => {
    spy = jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("prints total count", () => {
    jest.spyOn(bookmarkStore, "loadStore").mockReturnValue({
      bookmarks: [makeBookmark(), makeBookmark()],
    });
    makeProgram().parse(["node", "shelf", "summarize"]);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining("Total bookmarks : 2"));
  });

  it("counts pinned bookmarks", () => {
    jest.spyOn(bookmarkStore, "loadStore").mockReturnValue({
      bookmarks: [makeBookmark({ pinned: true }), makeBookmark()],
    });
    makeProgram().parse(["node", "shelf", "summarize"]);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining("Pinned          : 1"));
  });

  it("counts archived bookmarks", () => {
    jest.spyOn(bookmarkStore, "loadStore").mockReturnValue({
      bookmarks: [makeBookmark({ archived: true }), makeBookmark({ archived: true }), makeBookmark()],
    });
    makeProgram().parse(["node", "shelf", "summarize"]);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining("Archived        : 2"));
  });

  it("shows top domains", () => {
    jest.spyOn(bookmarkStore, "loadStore").mockReturnValue({
      bookmarks: [
        makeBookmark({ url: "https://github.com/foo" }),
        makeBookmark({ url: "https://github.com/bar" }),
        makeBookmark({ url: "https://news.ycombinator.com/item?id=1" }),
      ],
    });
    makeProgram().parse(["node", "shelf", "summarize"]);
    const calls = spy.mock.calls.map((c) => c[0]);
    expect(calls.some((c) => c.includes("github.com"))).toBe(true);
  });

  it("shows top tags", () => {
    jest.spyOn(bookmarkStore, "loadStore").mockReturnValue({
      bookmarks: [
        makeBookmark({ tags: ["typescript", "dev"] }),
        makeBookmark({ tags: ["typescript"] }),
        makeBookmark({ tags: ["linux"] }),
      ],
    });
    makeProgram().parse(["node", "shelf", "summarize"]);
    const calls = spy.mock.calls.map((c) => c[0]);
    expect(calls.some((c) => c.includes("typescript"))).toBe(true);
  });

  it("respects --top option", () => {
    const bookmarks = Array.from({ length: 10 }, (_, i) =>
      makeBookmark({ url: `https://site${i}.com/page`, tags: [`tag${i}`] })
    );
    jest.spyOn(bookmarkStore, "loadStore").mockReturnValue({ bookmarks });
    makeProgram().parse(["node", "shelf", "summarize", "--top", "3"]);
    const calls = spy.mock.calls.map((c) => c[0]);
    expect(calls.some((c) => c.includes("Top 3 domains"))).toBe(true);
  });
});
