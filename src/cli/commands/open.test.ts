import { Command } from "commander";
import { registerOpenCommand } from "./open";
import * as bookmarkStore from "../../store/bookmarkStore";
import * as searchModule from "../../search/searchBookmarks";
import open from "open";

jest.mock("open");
jest.mock("../../store/bookmarkStore");
jest.mock("../../search/searchBookmarks");

const mockedOpen = open as jest.MockedFunction<typeof open>;
const mockedLoadStore = bookmarkStore.loadStore as jest.Mock;
const mockedGetStorePath = bookmarkStore.getStorePath as jest.Mock;
const mockedSearch = searchModule.searchBookmarks as jest.Mock;

function makeProgram() {
  const program = new Command();
  program.exitOverride();
  registerOpenCommand(program);
  return program;
}

const sampleBookmarks = [
  { id: "1", title: "GitHub", url: "https://github.com", tags: ["dev"], createdAt: "2024-01-01" },
  { id: "2", title: "GitLab", url: "https://gitlab.com", tags: ["dev"], createdAt: "2024-01-02" },
];

beforeEach(() => {
  jest.clearAllMocks();
  mockedGetStorePath.mockReturnValue("/fake/store.json");
  mockedLoadStore.mockReturnValue({ bookmarks: sampleBookmarks });
  mockedOpen.mockResolvedValue(undefined as never);
});

describe("open command", () => {
  it("opens the first matching bookmark", async () => {
    mockedSearch.mockReturnValue([sampleBookmarks[0]]);
    const program = makeProgram();
    await program.parseAsync(["node", "test", "open", "github"]);
    expect(mockedOpen).toHaveBeenCalledWith("https://github.com");
  });

  it("opens first result when multiple matches exist with --first flag", async () => {
    mockedSearch.mockReturnValue(sampleBookmarks);
    const program = makeProgram();
    await program.parseAsync(["node", "test", "open", "git", "--first"]);
    expect(mockedOpen).toHaveBeenCalledWith("https://github.com");
  });

  it("exits with error when no bookmarks match", async () => {
    mockedSearch.mockReturnValue([]);
    const mockExit = jest.spyOn(process, "exit").mockImplementation(() => { throw new Error("exit"); });
    const program = makeProgram();
    await expect(program.parseAsync(["node", "test", "open", "nonexistent"])).rejects.toThrow();
    expect(mockExit).toHaveBeenCalledWith(1);
    mockExit.mockRestore();
  });

  it("shows multiple results when more than one match found", async () => {
    mockedSearch.mockReturnValue(sampleBookmarks);
    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    const program = makeProgram();
    await program.parseAsync(["node", "test", "open", "git"]);
    expect(consoleSpy).toHaveBeenCalledWith("Multiple matches found:");
    consoleSpy.mockRestore();
  });
});
