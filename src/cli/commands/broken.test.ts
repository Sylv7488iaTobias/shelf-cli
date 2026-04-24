import { Command } from "commander";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { registerBrokenCommand, BrokenCheckResult } from "./broken";
import * as bookmarkStore from "../../store/bookmarkStore";

function makeProgram() {
  const program = new Command();
  program.exitOverride();
  registerBrokenCommand(program);
  return program;
}

function makeBookmark(overrides = {}) {
  return {
    id: "abc123",
    name: "Example",
    url: "https://example.com",
    tags: [],
    folder: "default",
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

describe("broken command", () => {
  beforeEach(() => {
    vi.spyOn(bookmarkStore, "loadStore").mockReturnValue({
      bookmarks: [
        makeBookmark({ id: "1", name: "Good", url: "https://good.com" }),
        makeBookmark({ id: "2", name: "Bad", url: "https://bad.com" }),
        makeBookmark({ id: "3", name: "Down", url: "https://down.com" }),
      ],
    });

    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url === "https://good.com") {
        return Promise.resolve({ status: 200 });
      }
      if (url === "https://bad.com") {
        return Promise.resolve({ status: 404 });
      }
      return Promise.reject(new Error("ECONNREFUSED"));
    }) as any;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("reports broken bookmarks", async () => {
    const logs: string[] = [];
    vi.spyOn(console, "log").mockImplementation((msg) => logs.push(msg));

    const program = makeProgram();
    await program.parseAsync(["node", "test", "broken"]);

    const output = logs.join("\n");
    expect(output).toContain("HTTP 404");
    expect(output).toContain("Bad");
    expect(output).toContain("ECONNREFUSED");
    expect(output).toContain("Down");
    expect(output).not.toContain("Good");
  });

  it("reports all reachable when no broken links", async () => {
    (global.fetch as any) = vi.fn().mockResolvedValue({ status: 200 });
    const logs: string[] = [];
    vi.spyOn(console, "log").mockImplementation((msg) => logs.push(msg));

    const program = makeProgram();
    await program.parseAsync(["node", "test", "broken"]);

    expect(logs.join("\n")).toContain("All bookmarks appear to be reachable");
  });

  it("filters by folder", async () => {
    vi.spyOn(bookmarkStore, "loadStore").mockReturnValue({
      bookmarks: [
        makeBookmark({ id: "1", name: "Work", url: "https://work.com", folder: "work" }),
        makeBookmark({ id: "2", name: "Personal", url: "https://personal.com", folder: "personal" }),
      ],
    });
    (global.fetch as any) = vi.fn().mockResolvedValue({ status: 200 });
    const logs: string[] = [];
    vi.spyOn(console, "log").mockImplementation((msg) => logs.push(msg));

    const program = makeProgram();
    await program.parseAsync(["node", "test", "broken", "--folder", "work"]);

    expect(logs.join("\n")).toContain("1 bookmark(s)");
  });
});
