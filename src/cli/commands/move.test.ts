import { Command } from "commander";
import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";
import { registerMoveCommand } from "./move";

async function makeTempDir(): Promise<string> {
  return fs.mkdtemp(path.join(os.tmpdir(), "shelf-move-test-"));
}

async function makeStorePath(dir: string) {
  const storePath = path.join(dir, "bookmarks.json");
  const store = {
    bookmarks: [
      { name: "gh", url: "https://github.com", tags: ["dev"], createdAt: new Date().toISOString() },
      { name: "docs", url: "https://docs.example.com", tags: ["folder:old"], createdAt: new Date().toISOString() },
    ],
  };
  await fs.writeFile(storePath, JSON.stringify(store));
  return storePath;
}

function makeProgram(storePath: string) {
  const program = new Command();
  program.exitOverride();
  registerMoveCommand(program);
  return { program, storePath };
}

describe("move command", () => {
  let tmpDir: string;
  let storePath: string;

  beforeEach(async () => {
    tmpDir = await makeTempDir();
    storePath = await makeStorePath(tmpDir);
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it("moves a bookmark to a new folder", async () => {
    const { program } = makeProgram(storePath);
    await program.parseAsync(["node", "test", "move", "gh", "work", "--store", storePath]);
    const raw = JSON.parse(await fs.readFile(storePath, "utf-8"));
    const bm = raw.bookmarks.find((b: { name: string }) => b.name === "gh");
    expect(bm.tags).toContain("folder:work");
    expect(bm.tags).toContain("dev");
  });

  it("replaces an existing folder tag", async () => {
    const { program } = makeProgram(storePath);
    await program.parseAsync(["node", "test", "move", "docs", "reference", "--store", storePath]);
    const raw = JSON.parse(await fs.readFile(storePath, "utf-8"));
    const bm = raw.bookmarks.find((b: { name: string }) => b.name === "docs");
    expect(bm.tags).toContain("folder:reference");
    expect(bm.tags).not.toContain("folder:old");
  });

  it("exits with error if bookmark not found", async () => {
    const { program } = makeProgram(storePath);
    const exitSpy = jest.spyOn(process, "exit").mockImplementation(() => { throw new Error("exit"); });
    await expect(
      program.parseAsync(["node", "test", "move", "nonexistent", "work", "--store", storePath])
    ).rejects.toThrow();
    expect(exitSpy).toHaveBeenCalledWith(1);
    exitSpy.mockRestore();
  });
});
