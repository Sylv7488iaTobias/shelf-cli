import { Command } from "commander";
import * as fs from "fs/promises";
import * as os from "os";
import * as path from "path";
import { registerDueCommand } from "./due";

async function makeTempDir(): Promise<string> {
  return fs.mkdtemp(path.join(os.tmpdir(), "shelf-due-integration-"));
}

async function seedStore(dir: string) {
  const storePath = path.join(dir, "bookmarks.json");
  const bookmarks = [
    { id: "a1", title: "Alpha", url: "https://alpha.com", tags: ["work"] },
    { id: "b2", title: "Beta", url: "https://beta.com", tags: ["personal"], due: "2000-01-01T00:00:00.000Z" },
    { id: "c3", title: "Gamma", url: "https://gamma.com", tags: [], due: "2099-12-31T00:00:00.000Z" },
  ];
  await fs.writeFile(storePath, JSON.stringify({ bookmarks }));
  return storePath;
}

function makeProgram(): Command {
  const program = new Command();
  program.exitOverride();
  registerDueCommand(program);
  return program;
}

describe("due integration", () => {
  it("sets, lists, and clears a due date end-to-end", async () => {
    const dir = await makeTempDir();
    const storePath = await seedStore(dir);
    const program = makeProgram();

    // Set a due date on alpha
    await program.parseAsync(["node", "test", "due", "set", "a1", "2099-03-15", "--store", storePath]);
    const afterSet = JSON.parse(await fs.readFile(storePath, "utf-8"));
    expect(afterSet.bookmarks.find((b: any) => b.id === "a1").due).toContain("2099-03-15");

    // List should show all three now
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    await program.parseAsync(["node", "test", "due", "list", "--store", storePath]);
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("Alpha"));
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("Gamma"));
    logSpy.mockRestore();

    // List --overdue should show only Beta
    const overdueSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    await program.parseAsync(["node", "test", "due", "list", "--overdue", "--store", storePath]);
    expect(overdueSpy).toHaveBeenCalledWith(expect.stringContaining("Beta"));
    expect(overdueSpy).not.toHaveBeenCalledWith(expect.stringContaining("Alpha"));
    overdueSpy.mockRestore();

    // Clear due date from beta
    await program.parseAsync(["node", "test", "due", "clear", "b2", "--store", storePath]);
    const afterClear = JSON.parse(await fs.readFile(storePath, "utf-8"));
    expect(afterClear.bookmarks.find((b: any) => b.id === "b2").due).toBeUndefined();
  });

  it("reports no overdue bookmarks when none exist", async () => {
    const dir = await makeTempDir();
    const storePath = await seedStore(dir);
    // Clear beta's overdue date first
    const data = JSON.parse(await fs.readFile(storePath, "utf-8"));
    data.bookmarks.find((b: any) => b.id === "b2").due = undefined;
    delete data.bookmarks.find((b: any) => b.id === "b2").due;
    await fs.writeFile(storePath, JSON.stringify(data));

    const program = makeProgram();
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    await program.parseAsync(["node", "test", "due", "list", "--overdue", "--store", storePath]);
    expect(logSpy).toHaveBeenCalledWith("No overdue bookmarks.");
    logSpy.mockRestore();
  });
});
