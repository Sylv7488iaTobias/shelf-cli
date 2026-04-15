import { Command } from "commander";
import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";
import { registerTouchCommand } from "./touch";
import { saveStore } from "../../store/bookmarkStore";

async function makeTempDir(): Promise<string> {
  return fs.mkdtemp(path.join(os.tmpdir(), "shelf-touch-"));
}

function makeProgram(): Command {
  const program = new Command();
  program.exitOverride();
  registerTouchCommand(program);
  return program;
}

describe("touch command", () => {
  let tmpDir: string;
  let storePath: string;

  beforeEach(async () => {
    tmpDir = await makeTempDir();
    storePath = path.join(tmpDir, "bookmarks.json");
    await saveStore(storePath, {
      bookmarks: [
        {
          name: "alpha",
          url: "https://example.com",
          tags: [],
          createdAt: "2024-01-01T00:00:00.000Z",
          updatedAt: "2024-01-01T00:00:00.000Z",
        },
      ],
    });
  });

  afterEach(() => fs.rm(tmpDir, { recursive: true, force: true }));

  it("sets createdAt when --created is provided", async () => {
    const program = makeProgram();
    await program.parseAsync([
      "node", "test", "touch", "alpha",
      "--created", "2023-06-15T12:00:00.000Z",
      "--store", storePath,
    ]);
    const raw = await fs.readFile(storePath, "utf-8");
    const store = JSON.parse(raw);
    expect(store.bookmarks[0].createdAt).toBe("2023-06-15T12:00:00.000Z");
  });

  it("sets updatedAt when --updated is provided", async () => {
    const program = makeProgram();
    await program.parseAsync([
      "node", "test", "touch", "alpha",
      "--updated", "2025-01-01T00:00:00.000Z",
      "--store", storePath,
    ]);
    const raw = await fs.readFile(storePath, "utf-8");
    const store = JSON.parse(raw);
    expect(store.bookmarks[0].updatedAt).toBe("2025-01-01T00:00:00.000Z");
  });

  it("exits when neither --created nor --updated is provided", async () => {
    const program = makeProgram();
    const mockExit = jest.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("process.exit");
    });
    await expect(
      program.parseAsync(["node", "test", "touch", "alpha", "--store", storePath])
    ).rejects.toThrow();
    mockExit.mockRestore();
  });

  it("exits on invalid date string", async () => {
    const program = makeProgram();
    const mockExit = jest.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("process.exit");
    });
    await expect(
      program.parseAsync([
        "node", "test", "touch", "alpha",
        "--updated", "not-a-date",
        "--store", storePath,
      ])
    ).rejects.toThrow();
    mockExit.mockRestore();
  });
});
