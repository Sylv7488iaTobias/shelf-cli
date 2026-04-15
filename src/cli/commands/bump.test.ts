import { Command } from "commander";
import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";
import { registerBumpCommand } from "./bump";
import { saveStore } from "../../store/bookmarkStore";

async function makeTempDir(): Promise<string> {
  return fs.mkdtemp(path.join(os.tmpdir(), "shelf-bump-"));
}

function makeProgram(): Command {
  const program = new Command();
  program.exitOverride();
  registerBumpCommand(program);
  return program;
}

function makeBookmark(name: string, updatedAt?: string) {
  return {
    name,
    url: `https://example.com/${name}`,
    tags: [],
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: updatedAt ?? "2024-01-01T00:00:00.000Z",
  };
}

describe("bump command", () => {
  let tmpDir: string;
  let storePath: string;

  beforeEach(async () => {
    tmpDir = await makeTempDir();
    storePath = path.join(tmpDir, "bookmarks.json");
    await saveStore(storePath, {
      bookmarks: [
        makeBookmark("alpha", "2024-01-01T00:00:00.000Z"),
        makeBookmark("beta"),
      ],
    });
  });

  afterEach(() => fs.rm(tmpDir, { recursive: true, force: true }));

  it("updates updatedAt to a more recent timestamp", async () => {
    const program = makeProgram();
    await program.parseAsync(["node", "test", "bump", "alpha", "--store", storePath]);

    const raw = await fs.readFile(storePath, "utf-8");
    const store = JSON.parse(raw);
    const bookmark = store.bookmarks.find((b: any) => b.name === "alpha");
    expect(new Date(bookmark.updatedAt).getTime()).toBeGreaterThan(
      new Date("2024-01-01T00:00:00.000Z").getTime()
    );
  });

  it("exits with error when bookmark not found", async () => {
    const program = makeProgram();
    const mockExit = jest.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("process.exit");
    });
    await expect(
      program.parseAsync(["node", "test", "bump", "nonexistent", "--store", storePath])
    ).rejects.toThrow();
    mockExit.mockRestore();
  });

  it("does not modify other bookmarks", async () => {
    const program = makeProgram();
    await program.parseAsync(["node", "test", "bump", "alpha", "--store", storePath]);

    const raw = await fs.readFile(storePath, "utf-8");
    const store = JSON.parse(raw);
    const beta = store.bookmarks.find((b: any) => b.name === "beta");
    expect(beta.updatedAt).toBe("2024-01-01T00:00:00.000Z");
  });
});
