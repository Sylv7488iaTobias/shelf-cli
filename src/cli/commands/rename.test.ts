import { Command } from "commander";
import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";
import { registerRenameCommand } from "./rename";
import { saveStore } from "../../store/bookmarkStore";

async function makeTempDir(): Promise<string> {
  return fs.mkdtemp(path.join(os.tmpdir(), "shelf-rename-"));
}

function makeProgram(storePath: string): Command {
  const program = new Command();
  program.exitOverride();
  registerRenameCommand(program);
  return program;
}

const baseStore = () => ({
  version: 1,
  bookmarks: [
    { id: "1", name: "GitHub", url: "https://github.com", tags: [], folder: "", pinned: false, createdAt: new Date().toISOString() },
    { id: "2", name: "MDN", url: "https://developer.mozilla.org", tags: [], folder: "", pinned: false, createdAt: new Date().toISOString() },
  ],
});

test("renames an existing bookmark", async () => {
  const dir = await makeTempDir();
  const storePath = path.join(dir, "bookmarks.json");
  await saveStore(baseStore(), storePath);

  const program = makeProgram(storePath);
  await program.parseAsync(["node", "test", "rename", "GitHub", "GH", "--store", storePath]);

  const data = JSON.parse(await fs.readFile(storePath, "utf-8"));
  expect(data.bookmarks.find((b: any) => b.name === "GH")).toBeDefined();
  expect(data.bookmarks.find((b: any) => b.name === "GitHub")).toBeUndefined();
});

test("exits with error if old name not found", async () => {
  const dir = await makeTempDir();
  const storePath = path.join(dir, "bookmarks.json");
  await saveStore(baseStore(), storePath);

  const program = makeProgram(storePath);
  const mockExit = jest.spyOn(process, "exit").mockImplementation(() => { throw new Error("exit"); });

  await expect(
    program.parseAsync(["node", "test", "rename", "Nonexistent", "New", "--store", storePath])
  ).rejects.toThrow();

  mockExit.mockRestore();
});

test("exits with error if new name conflicts with existing bookmark", async () => {
  const dir = await makeTempDir();
  const storePath = path.join(dir, "bookmarks.json");
  await saveStore(baseStore(), storePath);

  const program = makeProgram(storePath);
  const mockExit = jest.spyOn(process, "exit").mockImplementation(() => { throw new Error("exit"); });

  await expect(
    program.parseAsync(["node", "test", "rename", "GitHub", "MDN", "--store", storePath])
  ).rejects.toThrow();

  mockExit.mockRestore();
});

test("rename is case-insensitive for lookup", async () => {
  const dir = await makeTempDir();
  const storePath = path.join(dir, "bookmarks.json");
  await saveStore(baseStore(), storePath);

  const program = makeProgram(storePath);
  await program.parseAsync(["node", "test", "rename", "github", "GitHubNew", "--store", storePath]);

  const data = JSON.parse(await fs.readFile(storePath, "utf-8"));
  expect(data.bookmarks.find((b: any) => b.name === "GitHubNew")).toBeDefined();
});
