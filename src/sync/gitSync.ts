import { execSync } from "child_process";
import * as path from "path";
import * as fs from "fs";

export interface SyncOptions {
  storePath: string;
  remote?: string;
  branch?: string;
}

export function isGitRepo(storePath: string): boolean {
  return fs.existsSync(path.join(storePath, ".git"));
}

export function initGitRepo(storePath: string): void {
  if (!fs.existsSync(storePath)) {
    fs.mkdirSync(storePath, { recursive: true });
  }
  if (!isGitRepo(storePath)) {
    execSync("git init", { cwd: storePath, stdio: "pipe" });
  }
}

export function commitChanges(storePath: string, message: string): void {
  try {
    execSync("git add -A", { cwd: storePath, stdio: "pipe" });
    execSync(`git commit -m "${message}"`, { cwd: storePath, stdio: "pipe" });
  } catch (err) {
    // Nothing to commit is acceptable
    const msg = (err as Error).message ?? "";
    if (!msg.includes("nothing to commit")) {
      throw err;
    }
  }
}

export function pushChanges(opts: SyncOptions): void {
  const { storePath, remote = "origin", branch = "main" } = opts;
  execSync(`git push ${remote} ${branch}`, { cwd: storePath, stdio: "pipe" });
}

export function pullChanges(opts: SyncOptions): void {
  const { storePath, remote = "origin", branch = "main" } = opts;
  execSync(`git pull ${remote} ${branch} --rebase`, {
    cwd: storePath,
    stdio: "pipe",
  });
}

export function syncStore(opts: SyncOptions): void {
  if (!isGitRepo(opts.storePath)) {
    throw new Error(`Not a git repository: ${opts.storePath}`);
  }
  pullChanges(opts);
  pushChanges(opts);
}
