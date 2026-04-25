import { describe, it, expect } from "vitest";
import { Command } from "commander";
import { clusterByDomain, clusterByTag } from "./cluster";
import { registerClusterCommand } from "./cluster";
import { Bookmark } from "../../store/bookmarkStore";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";

function makeBookmark(overrides: Partial<Bookmark> = {}): Bookmark {
  return {
    id: Math.random().toString(36).slice(2),
    name: "Test",
    url: "https://example.com",
    tags: [],
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

function makeProgram(storePath: string) {
  const program = new Command();
  program.exitOverride();
  registerClusterCommand(program);
  return { program };
}

describe("clusterByDomain", () => {
  it("groups bookmarks by hostname", () => {
    const bms = [
      makeBookmark({ url: "https://github.com/foo" }),
      makeBookmark({ url: "https://github.com/bar" }),
      makeBookmark({ url: "https://example.com/baz" }),
    ];
    const clusters = clusterByDomain(bms);
    expect(clusters[0].label).toBe("github.com");
    expect(clusters[0].bookmarks).toHaveLength(2);
    expect(clusters[1].label).toBe("example.com");
  });

  it("strips www prefix", () => {
    const bms = [makeBookmark({ url: "https://www.google.com/search" })];
    const clusters = clusterByDomain(bms);
    expect(clusters[0].label).toBe("google.com");
  });

  it("handles invalid URLs", () => {
    const bms = [makeBookmark({ url: "not-a-url" })];
    const clusters = clusterByDomain(bms);
    expect(clusters[0].label).toBe("unknown");
  });
});

describe("clusterByTag", () => {
  it("groups bookmarks by tag", () => {
    const bms = [
      makeBookmark({ tags: ["dev", "tools"] }),
      makeBookmark({ tags: ["dev"] }),
      makeBookmark({ tags: ["reading"] }),
    ];
    const clusters = clusterByTag(bms);
    const dev = clusters.find((c) => c.label === "dev");
    expect(dev?.bookmarks).toHaveLength(2);
  });

  it("places untagged bookmarks under 'untagged'", () => {
    const bms = [makeBookmark({ tags: [] })];
    const clusters = clusterByTag(bms);
    expect(clusters[0].label).toBe("untagged");
  });
});

describe("registerClusterCommand", () => {
  it("runs without error on a valid store", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "shelf-cluster-"));
    const storePath = path.join(dir, "bookmarks.json");
    fs.writeFileSync(
      storePath,
      JSON.stringify({
        bookmarks: [
          makeBookmark({ url: "https://github.com/a" }),
          makeBookmark({ url: "https://github.com/b" }),
        ],
      })
    );
    const { program } = makeProgram(storePath);
    expect(() =>
      program.parse(["node", "shelf", "cluster", "--store", storePath])
    ).not.toThrow();
  });
});
