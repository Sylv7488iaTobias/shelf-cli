import { Command } from "commander";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { registerRestoreCommand, validateBackupFile } from "./restore";
import { saveStore, loadStore } from "../../store/bookmarkStore";

function makeTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "shelf-restore-test-"));
}

function makeProgram(): Command {
  const program = new Command();
  program.exitOverride();
  registerRestoreCommand(program);
  return program;
}

const sampleStore = {
  bookmarks: [
    { id: "1", title: "Alpha", url: "https://alpha.com", tags: ["a"], createdAt: "2024-01-01T00:00:00.000Z" },
    { id: "2", title: "Beta", url: "https://beta.com", tags: [], createdAt: "2024-01-02T00:00:00.000Z" },
  ],
};

describe("validateBackupFile", () => {
  it("parses a valid backup file", () => {
    const dir = makeTempDir();
    const file = path.join(dir, "backup.json");
    fs.writeFileSync(file, JSON.stringify(sampleStore));
    const result = validateBackupFile(file);
    expect(result.bookmarks).toHaveLength(2);
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it("throws on invalid backup", () => {
    const dir = makeTempDir();
    const file = path.join(dir, "bad.json");
    fs.writeFileSync(file, JSON.stringify({ wrong: true }));
    expect(() => validateBackupFile(file)).toThrow("Invalid backup file");
    fs.rmSync(dir, { recursive: true, force: true });
  });
});

describe("restore command", () => {
  let tmpDir: string;
  let storeDir: string;
  let backupFile: string;

  beforeEach(() => {
    tmpDir = makeTempDir();
    storeDir = makeTempDir();
    backupFile = path.join(tmpDir, "backup.json");
    fs.writeFileSync(backupFile, JSON.stringify(sampleStore));
    const storePath = path.join(storeDir, "bookmarks.json");
    saveStore(storePath, { bookmarks: [] });
    process.env.SHELF_STORE_PATH = storePath;
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
    fs.rmSync(storeDir, { recursive: true, force: true });
    delete process.env.SHELF_STORE_PATH;
  });

  it("restores bookmarks from a backup file", async () => {
    const program = makeProgram();
    await program.parseAsync(["node", "shelf", "restore", backupFile]);
    const store = loadStore(process.env.SHELF_STORE_PATH!);
    expect(store.bookmarks).toHaveLength(2);
  });

  it("performs a dry run without writing", async () => {
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    const program = makeProgram();
    await program.parseAsync(["node", "shelf", "restore", backupFile, "--dry-run"]);
    const store = loadStore(process.env.SHELF_STORE_PATH!);
    expect(store.bookmarks).toHaveLength(0);
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("Dry run"));
    logSpy.mockRestore();
  });

  it("merges without duplicating existing URLs", async () => {
    const storePath = process.env.SHELF_STORE_PATH!;
    saveStore(storePath, { bookmarks: [sampleStore.bookmarks[0]] });
    const program = makeProgram();
    await program.parseAsync(["node", "shelf", "restore", backupFile, "--merge"]);
    const store = loadStore(storePath);
    expect(store.bookmarks).toHaveLength(2);
  });
});
