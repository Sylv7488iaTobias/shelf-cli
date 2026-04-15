import { Command } from "commander";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { createSnapshotFilename, registerSnapshotCommand } from "./snapshot";
import { saveStore } from "../../store/bookmarkStore";

function makeTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "shelf-snapshot-"));
}

function makeStorePath(dir: string) {
  const storePath = path.join(dir, "bookmarks.json");
  saveStore(storePath, {
    bookmarks: [
      { id: "1", url: "https://example.com", title: "Example", tags: [], folder: "", pinned: false, archived: false, createdAt: new Date().toISOString(), visits: 0 },
      { id: "2", url: "https://test.org", title: "Test", tags: ["dev"], folder: "work", pinned: false, archived: false, createdAt: new Date().toISOString(), visits: 2 },
    ],
  });
  return storePath;
}

function makeProgram(storePath: string): Command {
  const program = new Command();
  program.exitOverride();
  registerSnapshotCommand(program);
  return program;
}

describe("createSnapshotFilename", () => {
  it("returns a filename starting with snapshot-", () => {
    const name = createSnapshotFilename();
    expect(name).toMatch(/^snapshot-\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}\.json$/);
  });
});

describe("snapshot command", () => {
  let tmpDir: string;
  let storePath: string;
  let outDir: string;

  beforeEach(() => {
    tmpDir = makeTempDir();
    storePath = makeStorePath(tmpDir);
    outDir = path.join(tmpDir, "snapshots");
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("creates a snapshot file in the output directory", () => {
    const program = makeProgram(storePath);
    program.parse(["node", "shelf", "snapshot", "--store", storePath, "--output", outDir]);
    const files = fs.readdirSync(outDir);
    expect(files.length).toBe(1);
    expect(files[0]).toMatch(/^snapshot-.*\.json$/);
  });

  it("saves correct bookmark count in snapshot", () => {
    const program = makeProgram(storePath);
    program.parse(["node", "shelf", "snapshot", "--store", storePath, "--output", outDir]);
    const files = fs.readdirSync(outDir);
    const data = JSON.parse(fs.readFileSync(path.join(outDir, files[0]), "utf-8"));
    expect(data.total).toBe(2);
    expect(data.bookmarks).toHaveLength(2);
  });

  it("uses custom name when --name is provided", () => {
    const program = makeProgram(storePath);
    program.parse(["node", "shelf", "snapshot", "--store", storePath, "--output", outDir, "--name", "my-snap"]);
    expect(fs.existsSync(path.join(outDir, "my-snap.json"))).toBe(true);
  });

  it("includes createdAt timestamp in snapshot", () => {
    const program = makeProgram(storePath);
    program.parse(["node", "shelf", "snapshot", "--store", storePath, "--output", outDir]);
    const files = fs.readdirSync(outDir);
    const data = JSON.parse(fs.readFileSync(path.join(outDir, files[0]), "utf-8"));
    expect(data.createdAt).toBeTruthy();
    expect(new Date(data.createdAt).getFullYear()).toBeGreaterThanOrEqual(2024);
  });
});
