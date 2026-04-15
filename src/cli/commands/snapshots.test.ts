import { Command } from "commander";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { listSnapshots, registerSnapshotsCommand } from "./snapshots";

function makeTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "shelf-snapshots-"));
}

function writeSnapshot(dir: string, name: string, data: object) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, name), JSON.stringify(data), "utf-8");
}

function makeProgram(): Command {
  const program = new Command();
  program.exitOverride();
  registerSnapshotsCommand(program);
  return program;
}

describe("listSnapshots", () => {
  let tmpDir: string;

  beforeEach(() => { tmpDir = makeTempDir(); });
  afterEach(() => { fs.rmSync(tmpDir, { recursive: true, force: true }); });

  it("returns empty array when directory does not exist", () => {
    expect(listSnapshots(path.join(tmpDir, "nope"))).toEqual([]);
  });

  it("lists snapshot files sorted by createdAt descending", () => {
    writeSnapshot(tmpDir, "a.json", { createdAt: "2024-01-01T00:00:00.000Z", total: 3, bookmarks: [] });
    writeSnapshot(tmpDir, "b.json", { createdAt: "2024-06-15T12:00:00.000Z", total: 7, bookmarks: [] });
    const result = listSnapshots(tmpDir);
    expect(result[0].file).toBe("b.json");
    expect(result[1].file).toBe("a.json");
  });

  it("skips malformed JSON files", () => {
    fs.writeFileSync(path.join(tmpDir, "bad.json"), "not json", "utf-8");
    writeSnapshot(tmpDir, "good.json", { createdAt: "2024-03-01T00:00:00.000Z", total: 1, bookmarks: [] });
    const result = listSnapshots(tmpDir);
    expect(result).toHaveLength(1);
    expect(result[0].file).toBe("good.json");
  });
});

describe("snapshots command", () => {
  let tmpDir: string;

  beforeEach(() => { tmpDir = makeTempDir(); });
  afterEach(() => { fs.rmSync(tmpDir, { recursive: true, force: true }); });

  it("prints no snapshots message when dir is empty", () => {
    const spy = jest.spyOn(console, "log").mockImplementation(() => {});
    const program = makeProgram();
    program.parse(["node", "shelf", "snapshots", "--dir", tmpDir]);
    expect(spy).toHaveBeenCalledWith("No snapshots found.");
    spy.mockRestore();
  });

  it("outputs JSON when --json flag is set", () => {
    writeSnapshot(tmpDir, "snap.json", { createdAt: "2024-05-01T00:00:00.000Z", total: 2, bookmarks: [] });
    const spy = jest.spyOn(console, "log").mockImplementation(() => {});
    const program = makeProgram();
    program.parse(["node", "shelf", "snapshots", "--dir", tmpDir, "--json"]);
    const output = spy.mock.calls[0][0];
    const parsed = JSON.parse(output);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed[0].file).toBe("snap.json");
    spy.mockRestore();
  });
});
