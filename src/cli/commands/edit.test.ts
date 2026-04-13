import { Command } from "commander";
import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";
import { registerEditCommand } from "./edit";
import { saveStore, loadStore } from "../../store/bookmarkStore";

async function makeTempDir(): Promise<string> {
  return fs.mkdtemp(path.join(os.tmpdir(), "shelf-edit-test-"));
}

function makeProgram(): Command {
  const program = new Command();
  program.exitOverride();
  registerEditCommand(program);
  return program;
}

describe("edit command", () => {
  let tmpDir: string;
  let storePath: string;

  beforeEach(async () => {
    tmpDir = await makeTempDir();
    storePath = path.join(tmpDir, "bookmarks.json");
    process.env.SHELF_STORE_PATH = storePath;

    await saveStore(storePath, {
      bookmarks: [
        {
          name: "example",
          url: "https://example.com",
          tags: ["web"],
          description: "An example site",
          createdAt: "2024-01-01T00:00:00.000Z",
          updatedAt: "2024-01-01T00:00:00.000Z",
          pinned: false,
        },
      ],
    });
  });

  afterEach(async () => {
    delete process.env.SHELF_STORE_PATH;
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it("updates the URL of an existing bookmark", async () => {
    const program = makeProgram();
    await program.parseAsync(["edit", "example", "--url", "https://new.example.com"], { from: "user" });
    const store = await loadStore(storePath);
    expect(store.bookmarks[0].url).toBe("https://new.example.com");
  });

  it("updates the tags of an existing bookmark", async () => {
    const program = makeProgram();
    await program.parseAsync(["edit", "example", "--tags", "news,tech"], { from: "user" });
    const store = await loadStore(storePath);
    expect(store.bookmarks[0].tags).toEqual(["news", "tech"]);
  });

  it("updates the description of an existing bookmark", async () => {
    const program = makeProgram();
    await program.parseAsync(["edit", "example", "--desc", "Updated description"], { from: "user" });
    const store = await loadStore(storePath);
    expect(store.bookmarks[0].description).toBe("Updated description");
  });

  it("updates the updatedAt timestamp on change", async () => {
    const program = makeProgram();
    await program.parseAsync(["edit", "example", "--url", "https://changed.com"], { from: "user" });
    const store = await loadStore(storePath);
    expect(store.bookmarks[0].updatedAt).not.toBe("2024-01-01T00:00:00.000Z");
  });

  it("exits with error when bookmark not found", async () => {
    const program = makeProgram();
    const mockExit = jest.spyOn(process, "exit").mockImplementation(() => { throw new Error("exit"); });
    await expect(
      program.parseAsync(["edit", "nonexistent", "--url", "https://x.com"], { from: "user" })
    ).rejects.toThrow("exit");
    mockExit.mockRestore();
  });
});
