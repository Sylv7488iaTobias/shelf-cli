import { Command } from "commander";
import { registerAliasCommand } from "./alias";
import { loadStore, saveStore } from "../../store/bookmarkStore";

jest.mock("../../store/bookmarkStore");

const mockLoad = loadStore as jest.MockedFunction<typeof loadStore>;
const mockSave = saveStore as jest.MockedFunction<typeof saveStore>;

function makeProgram() {
  const program = new Command();
  program.exitOverride();
  registerAliasCommand(program);
  return program;
}

const baseBookmark = {
  id: "abc123",
  url: "https://example.com",
  title: "Example",
  tags: [],
  createdAt: new Date().toISOString(),
};

beforeEach(() => {
  jest.clearAllMocks();
  mockSave.mockResolvedValue(undefined);
});

test("set creates an alias for a bookmark", async () => {
  mockLoad.mockResolvedValue({ bookmarks: [baseBookmark], aliases: {} } as any);
  const spy = jest.spyOn(console, "log").mockImplementation(() => {});
  await makeProgram().parseAsync(["node", "shelf", "alias", "set", "ex", "abc123"]);
  expect(mockSave).toHaveBeenCalledWith(
    undefined,
    expect.objectContaining({ aliases: { ex: "abc123" } })
  );
  expect(spy).toHaveBeenCalledWith(expect.stringContaining("ex"));
  spy.mockRestore();
});

test("get prints the url for an alias", async () => {
  mockLoad.mockResolvedValue({ bookmarks: [baseBookmark], aliases: { ex: "abc123" } } as any);
  const spy = jest.spyOn(console, "log").mockImplementation(() => {});
  await makeProgram().parseAsync(["node", "shelf", "alias", "get", "ex"]);
  expect(spy).toHaveBeenCalledWith(expect.stringContaining("https://example.com"));
  spy.mockRestore();
});

test("remove deletes an alias", async () => {
  mockLoad.mockResolvedValue({ bookmarks: [baseBookmark], aliases: { ex: "abc123" } } as any);
  const spy = jest.spyOn(console, "log").mockImplementation(() => {});
  await makeProgram().parseAsync(["node", "shelf", "alias", "remove", "ex"]);
  expect(mockSave).toHaveBeenCalledWith(
    undefined,
    expect.objectContaining({ aliases: {} })
  );
  spy.mockRestore();
});

test("list shows all aliases", async () => {
  mockLoad.mockResolvedValue({ bookmarks: [baseBookmark], aliases: { ex: "abc123" } } as any);
  const spy = jest.spyOn(console, "log").mockImplementation(() => {});
  await makeProgram().parseAsync(["node", "shelf", "alias", "list"]);
  expect(spy).toHaveBeenCalledWith(expect.stringContaining("ex"));
  spy.mockRestore();
});

test("list shows message when no aliases", async () => {
  mockLoad.mockResolvedValue({ bookmarks: [], aliases: {} } as any);
  const spy = jest.spyOn(console, "log").mockImplementation(() => {});
  await makeProgram().parseAsync(["node", "shelf", "alias", "list"]);
  expect(spy).toHaveBeenCalledWith("No aliases defined.");
  spy.mockRestore();
});
