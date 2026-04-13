import { Command } from "commander";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { createBackupFilename, registerBackupCommand } from "./backup";
import { saveStore } from "../../store/bookmarkStore";

function makeTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "shelf-backup-test-"));
}

function makeProgram(): Command {
  const program = new Command();
  program.exitOverride();
  registerBackupCommand(program);
  return program;
}

describe("createBackupFilename", () => {
  it("should return a filename matching the expected pattern", () => {
    const name = createBackupFilename();
    expect(name).toMatch(/^shelf-backup-\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}\.json$/);
  });

  it("should return unique filenames across calls separated in time", async () => {
    const a = createBackupFilename();
    await new Promise((r) => setTimeout(r, 1100));
    const b = createBackupFilename();
    expect(a).not.toBe(b);
  });
});

describe("backup command", () => {
  let tmpDir: string;
  let storeDir: string;

  beforeEach(() => {
    tmpDir = makeTempDir();
    storeDir = makeTempDir();
    const storePath = path.join(storeDir, "bookmarks.json");
    saveStore(storePath, {
      bookmarks: [
        { id: "1", title: "Example", url: "https://example.com", tags: [], createdAt: new Date().toISOString() },
      ],
    });
    process.env.SHELF_STORE_PATH = storePath;
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
    fs.rmSync(storeDir, { recursive: true, force: true });
    delete process.env.SHELF_STORE_PATH;
  });

  it("creates a backup JSON file in the specified output directory", async () => {
    const program = makeProgram();
    await program.parseAsync(["node", "shelf", "backup", "--output", tmpDir]);
    const files = fs.readdirSync(tmpDir).filter((f) => f.startsWith("shelf-backup-"));
    expect(files).toHaveLength(1);
    const content = JSON.parse(fs.readFileSync(path.join(tmpDir, files[0]), "utf-8"));
    expect(content.bookmarks).toHaveLength(1);
  });

  it("lists existing backups with --list flag", async () => {
    const program = makeProgram();
    await program.parseAsync(["node", "shelf", "backup", "--output", tmpDir]);
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    const program2 = makeProgram();
    await program2.parseAsync(["node", "shelf", "backup", "--output", tmpDir, "--list"]);
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("1 backup"));
    logSpy.mockRestore();
  });

  it("reports no backups when directory is empty", async () => {
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    const program = makeProgram();
    await program.parseAsync(["node", "shelf", "backup", "--output", tmpDir, "--list"]);
    expect(logSpy).toHaveBeenCalledWith("No backups found.");
    logSpy.mockRestore();
  });
});
