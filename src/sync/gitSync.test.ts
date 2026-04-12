import * as os from "os";
import * as path from "path";
import * as fs from "fs";
import { execSync } from "child_process";
import {
  isGitRepo,
  initGitRepo,
  commitChanges,
} from "./gitSync";

function makeTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "shelf-sync-test-"));
}

describe("gitSync", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = makeTempDir();
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  test("isGitRepo returns false for plain directory", () => {
    expect(isGitRepo(tmpDir)).toBe(false);
  });

  test("initGitRepo creates a git repository", () => {
    initGitRepo(tmpDir);
    expect(isGitRepo(tmpDir)).toBe(true);
  });

  test("initGitRepo creates storePath if it does not exist", () => {
    const newDir = path.join(tmpDir, "nested", "store");
    initGitRepo(newDir);
    expect(isGitRepo(newDir)).toBe(true);
  });

  test("commitChanges commits a new file", () => {
    initGitRepo(tmpDir);
    // Configure git identity for the temp repo
    execSync('git config user.email "test@shelf.cli"', { cwd: tmpDir });
    execSync('git config user.name "Shelf Test"', { cwd: tmpDir });

    const filePath = path.join(tmpDir, "bookmarks.json");
    fs.writeFileSync(filePath, JSON.stringify({ bookmarks: [] }));

    expect(() => commitChanges(tmpDir, "add bookmarks file")).not.toThrow();

    const log = execSync("git log --oneline", { cwd: tmpDir }).toString();
    expect(log).toContain("add bookmarks file");
  });

  test("commitChanges does not throw when nothing to commit", () => {
    initGitRepo(tmpDir);
    execSync('git config user.email "test@shelf.cli"', { cwd: tmpDir });
    execSync('git config user.name "Shelf Test"', { cwd: tmpDir });
    expect(() => commitChanges(tmpDir, "empty commit")).not.toThrow();
  });
});
