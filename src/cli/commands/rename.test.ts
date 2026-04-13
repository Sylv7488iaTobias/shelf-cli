import { Command } from "commander";
import { registerRenameCommand } from "./rename";
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
  registerRenameCommand(program);
  return program;
}

const sampleStore = () => ({
  bookmarks: [
    { id: "abc123", title: "Old Title", url: "https://example.com", tags: [], createdAt: "2024-01-01" },
  ],
});

beforeEach(() => {
  jest.clearAllMocks();
  mockSaveStore.mockResolvedValue(undefined);
  mockCommit.mockResolvedValue(undefined);
});

test("renames a bookmark by id", async () => {
  const store = sampleStore();
  mockLoadStore.mockResolvedValue(store as any);
  const consoleSpy = jest.spyOn(console, "log").mockImplementation();

  await makeProgram().parseAsync(["node", "test", "rename", "abc123", "New Title"]);

  expect(store.bookmarks[0].title).toBe("New Title");
  expect(mockSaveStore).toHaveBeenCalledWith(store);
  expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("New Title"));
  consoleSpy.mockRestore();
});

test("errors when bookmark id not found", async () => {
  mockLoadStore.mockResolvedValue(sampleStore() as any);
  const exitSpy = jest.spyOn(process, "exit").mockImplementation(() => { throw new Error("exit"); });
  const errorSpy = jest.spyOn(console, "error").mockImplementation();

  await expect(
    makeProgram().parseAsync(["node", "test", "rename", "notreal", "New Title"])
  ).rejects.toThrow();

  expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining("No bookmark found"));
  exitSpy.mockRestore();
  errorSpy.mockRestore();
});

test("commits changes when --sync flag is passed", async () => {
  const store = sampleStore();
  mockLoadStore.mockResolvedValue(store as any);
  const consoleSpy = jest.spyOn(console, "log").mockImplementation();

  await makeProgram().parseAsync(["node", "test", "rename", "abc123", "Synced Title", "--sync"]);

  expect(mockCommit).toHaveBeenCalledWith(expect.stringContaining("abc123"));
  consoleSpy.mockRestore();
});

test("errors on empty new title", async () => {
  mockLoadStore.mockResolvedValue(sampleStore() as any);
  const exitSpy = jest.spyOn(process, "exit").mockImplementation(() => { throw new Error("exit"); });
  const errorSpy = jest.spyOn(console, "error").mockImplementation();

  await expect(
    makeProgram().parseAsync(["node", "test", "rename", "abc123", "   "])
  ).rejects.toThrow();

  expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining("cannot be empty"));
  exitSpy.mockRestore();
  errorSpy.mockRestore();
});
