import { Command } from "commander";
import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";
import { registerRenameCommand } from "./rename";

async function makeTempDir(): Promise<string> {
  return fs.mkdtemp(path.join(os.tmpdir(), "shelf-rename-test-"));
}

function makeProgram(): Command {
  const program = new Command();
  program.exitOverride();
  registerRenameCommand(program);
  return program;
}

async function makeStorePath(dir: string, bookmarks: object[]): Promise<string> {
  const storePath = path.join(dir, "bookmarks.json");
  await fs.writeFile(
    storePath,
    JSON.stringify({ bookmarks }, null, 2),
    "utf-8"
  );
  return storePath;
}

describe("rename command", () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await makeTempDir();
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it("renames a bookmark successfully", async () => {
    const storePath = await makeStorePath(tmpDir, [
      { name: "GitHub", url: "https://github.com", tags: [], folder: "", pinned: false, createdAt: new Date().toISOString() },
    ]);

    const program = makeProgram();
    await program.parseAsync(["rename", "GitHub", "GH", "--store", storePath], { from: "user" });

    const raw = await fs.readFile(storePath, "utf-8");
    const store = JSON.parse(raw);
    expect(store.bookmarks[0].name).toBe("GH");
  });

  it("exits with error if old name not found", async () => {
    const storePath = await makeStorePath(tmpDir, [
      { name: "GitHub", url: "https://github.com", tags: [], folder: "", pinned: false, createdAt: new Date().toISOString() },
    ]);

    const program = makeProgram();
    const mockExit = jest.spyOn(process, "exit").mockImplementation(() => { throw new Error("exit"); });

    await expect(
      program.parseAsync(["rename", "NotExist", "NewName", "--store", storePath], { from: "user" })
    ).rejects.toThrow();

    mockExit.mockRestore();
  });

  it("exits with error if new name already exists", async () => {
    const storePath = await makeStorePath(tmpDir, [
      { name: "GitHub", url: "https://github.com", tags: [], folder: "", pinned: false, createdAt: new Date().toISOString() },
      { name: "GitLab", url: "https://gitlab.com", tags: [], folder: "", pinned: false, createdAt: new Date().toISOString() },
    ]);

    const program = makeProgram();
    const mockExit = jest.spyOn(process, "exit").mockImplementation(() => { throw new Error("exit"); });

    await expect(
      program.parseAsync(["rename", "GitHub", "GitLab", "--store", storePath], { from: "user" })
    ).rejects.toThrow();

    mockExit.mockRestore();
  });

  it("rename is case-insensitive for lookup but preserves new name casing", async () => {
    const storePath = await makeStorePath(tmpDir, [
      { name: "github", url: "https://github.com", tags: [], folder: "", pinned: false, createdAt: new Date().toISOString() },
    ]);

    const program = makeProgram();
    await program.parseAsync(["rename", "GITHUB", "MyGitHub", "--store", storePath], { from: "user" });

    const raw = await fs.readFile(storePath, "utf-8");
    const store = JSON.parse(raw);
    expect(store.bookmarks[0].name).toBe("MyGitHub");
  });
});
