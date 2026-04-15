import { Command } from "commander";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { registerFavoriteCommand } from "./favorite";
import { saveStore } from "../../store/bookmarkStore";

function makeTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "shelf-fav-"));
}

function makeProgram(storePath: string): Command {
  const program = new Command();
  program.exitOverride();
  registerFavoriteCommand(program);
  return program;
}

function makeStore(storePath: string, bookmarks: object[]) {
  saveStore(storePath, { bookmarks } as any);
}

describe("favorite command", () => {
  let dir: string;
  let storePath: string;

  beforeEach(() => {
    dir = makeTempDir();
    storePath = path.join(dir, "bookmarks.json");
    makeStore(storePath, [
      { name: "GitHub", url: "https://github.com", tags: ["dev"], favorite: false },
      { name: "OpenAI", url: "https://openai.com", tags: ["ai"], favorite: true },
    ]);
  });

  afterEach(() => {
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it("marks a bookmark as favorite", async () => {
    const program = makeProgram(storePath);
    const spy = jest.spyOn(console, "log").mockImplementation(() => {});
    await program.parseAsync(["node", "test", "favorite", "GitHub", "--store", storePath]);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining("marked as favorite"));
    spy.mockRestore();
  });

  it("removes a bookmark from favorites if already favorited", async () => {
    const program = makeProgram(storePath);
    const spy = jest.spyOn(console, "log").mockImplementation(() => {});
    await program.parseAsync(["node", "test", "fav", "OpenAI", "--store", storePath]);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining("removed from favorites"));
    spy.mockRestore();
  });

  it("lists all favorited bookmarks", async () => {
    const program = makeProgram(storePath);
    const spy = jest.spyOn(console, "log").mockImplementation(() => {});
    await program.parseAsync(["node", "test", "favorite", "ignored", "--store", storePath, "--list"]);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining("OpenAI"));
    spy.mockRestore();
  });

  it("exits with error for unknown bookmark", async () => {
    const program = makeProgram(storePath);
    const spy = jest.spyOn(process, "exit").mockImplementation((code?: string | number | null | undefined) => { throw new Error(`exit:${code}`); });
    const errSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    await expect(
      program.parseAsync(["node", "test", "favorite", "Unknown", "--store", storePath])
    ).rejects.toThrow("exit:1");
    errSpy.mockRestore();
    spy.mockRestore();
  });
});
