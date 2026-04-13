import { Command } from "commander";
import { registerPinCommand } from "./pin";
import { loadStore, saveStore } from "../../store/bookmarkStore";
import { commitBookmarkChanges } from "../../sync";

jest.mock("../../store/bookmarkStore");
jest.mock("../../sync");

const mockLoadStore = loadStore as jest.MockedFunction<typeof loadStore>;
const mockSaveStore = saveStore as jest.MockedFunction<typeof saveStore>;
const mockCommit = commitBookmarkChanges as jest.MockedFunction<typeof commitBookmarkChanges>;

function makeProgram() {
  const program = new Command();
  program.exitOverride();
  registerPinCommand(program);
  return program;
}

const baseStore = () => ({
  version: 1,
  bookmarks: [
    { name: "github", url: "https://github.com", tags: [], pinned: false },
    { name: "docs", url: "https://docs.example.com", tags: [], pinned: true },
  ],
});

beforeEach(() => {
  jest.clearAllMocks();
  mockSaveStore.mockResolvedValue(undefined);
  mockCommit.mockResolvedValue(undefined);
});

test("pins an unpinned bookmark", async () => {
  const store = baseStore();
  mockLoadStore.mockResolvedValue(store);
  const program = makeProgram();
  await program.parseAsync(["node", "shelf", "pin", "github", "--no-sync"]);
  expect(store.bookmarks[0].pinned).toBe(true);
  expect(mockSaveStore).toHaveBeenCalled();
});

test("unpins a pinned bookmark", async () => {
  const store = baseStore();
  mockLoadStore.mockResolvedValue(store);
  const program = makeProgram();
  await program.parseAsync(["node", "shelf", "pin", "docs", "--unpin", "--no-sync"]);
  expect(store.bookmarks[1].pinned).toBe(false);
  expect(mockSaveStore).toHaveBeenCalled();
});

test("exits with error for unknown bookmark", async () => {
  mockLoadStore.mockResolvedValue(baseStore());
  const program = makeProgram();
  const mockExit = jest.spyOn(process, "exit").mockImplementation(() => { throw new Error("exit"); });
  await expect(program.parseAsync(["node", "shelf", "pin", "unknown", "--no-sync"])).rejects.toThrow();
  expect(mockExit).toHaveBeenCalledWith(1);
  mockExit.mockRestore();
});

test("commits changes when sync is enabled", async () => {
  const store = baseStore();
  mockLoadStore.mockResolvedValue(store);
  const program = makeProgram();
  await program.parseAsync(["node", "shelf", "pin", "github"]);
  expect(mockCommit).toHaveBeenCalledWith(expect.stringContaining("pinned bookmark"), undefined);
});

test("skips commit when --no-sync is passed", async () => {
  mockLoadStore.mockResolvedValue(baseStore());
  const program = makeProgram();
  await program.parseAsync(["node", "shelf", "pin", "github", "--no-sync"]);
  expect(mockCommit).not.toHaveBeenCalled();
});
