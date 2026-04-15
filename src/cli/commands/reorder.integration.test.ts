import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";
import { Command } from "commander";
import { registerReorderCommand } from "./reorder";
import { saveStore } from "../../store/bookmarkStore";

async function makeTempDir() {
  return fs.mkdtemp(path.join(os.tmpdir(), "shelf-reorder-"));
}

function makeBookmark(id: string, url: string) {
  return {
    id,
    url,
    title: id,
    tags: [] as string[],
    folder: "",
    createdAt: Date.now(),
  };
}

describe("reorder integration", () => {
  let tmpDir: string;
  let storePath: string;

  beforeEach(async () => {
    tmpDir = await makeTempDir();
    storePath = path.join(tmpDir, "bookmarks.json");
    const store = {
      bookmarks: [
        makeBookmark("id1", "https://one.com"),
        makeBookmark("id2", "https://two.com"),
        makeBookmark("id3", "https://three.com"),
      ],
    };
    await saveStore(store, storePath);
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it("reorders bookmarks in the store file", async () => {
    const program = new Command();
    program.exitOverride();
    registerReorderCommand(program);

    await program.parseAsync([
      "node",
      "test",
      "reorder",
      "id3",
      "id1",
      "--store",
      storePath,
    ]);

    const raw = await fs.readFile(storePath, "utf-8");
    const stored = JSON.parse(raw);
    expect(stored.bookmarks[0].id).toBe("id3");
    expect(stored.bookmarks[1].id).toBe("id1");
    expect(stored.bookmarks[2].id).toBe("id2");
  });

  it("exits with error for unknown id", async () => {
    const program = new Command();
    program.exitOverride();
    registerReorderCommand(program);

    const exitSpy = vi
      .spyOn(process, "exit")
      .mockImplementation((() => {}) as never);
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await program.parseAsync([
      "node",
      "test",
      "reorder",
      "unknown-id",
      "--store",
      storePath,
    ]);

    expect(exitSpy).toHaveBeenCalledWith(1);
    exitSpy.mockRestore();
    errSpy.mockRestore();
  });
});
