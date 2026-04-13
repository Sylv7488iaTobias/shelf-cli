import { Command } from "commander";
import * as fs from "fs";
import * as path from "path";
import { registerExportCommand } from "./export";
import * as bookmarkStore from "../../store/bookmarkStore";

jest.mock("../../store/bookmarkStore");
jest.mock("fs");

const mockedLoadStore = bookmarkStore.loadStore as jest.Mock;
const mockedGetStorePath = bookmarkStore.getStorePath as jest.Mock;
const mockedWriteFileSync = fs.writeFileSync as jest.Mock;

function makeProgram() {
  const program = new Command();
  program.exitOverride();
  registerExportCommand(program);
  return program;
}

const sampleBookmarks = [
  { id: "1", title: "GitHub", url: "https://github.com", tags: ["dev", "git"], createdAt: "2024-01-01" },
  { id: "2", title: "MDN", url: "https://developer.mozilla.org", tags: ["docs"], createdAt: "2024-01-02" },
];

beforeEach(() => {
  jest.clearAllMocks();
  mockedGetStorePath.mockReturnValue("/fake/store.json");
  mockedLoadStore.mockReturnValue({ bookmarks: sampleBookmarks });
});

describe("export command", () => {
  it("exports bookmarks as JSON by default", async () => {
    const program = makeProgram();
    await program.parseAsync(["node", "test", "export", "out.json"]);
    const written = mockedWriteFileSync.mock.calls[0][1] as string;
    const parsed = JSON.parse(written);
    expect(parsed.bookmarks).toHaveLength(2);
  });

  it("exports bookmarks as CSV", async () => {
    const program = makeProgram();
    await program.parseAsync(["node", "test", "export", "out.csv", "--format", "csv"]);
    const written = mockedWriteFileSync.mock.calls[0][1] as string;
    expect(written).toContain("id,title,url,tags,createdAt");
    expect(written).toContain("GitHub");
  });

  it("exports bookmarks as Markdown", async () => {
    const program = makeProgram();
    await program.parseAsync(["node", "test", "export", "out.md", "--format", "markdown"]);
    const written = mockedWriteFileSync.mock.calls[0][1] as string;
    expect(written).toContain("# Bookmarks");
    expect(written).toContain("[GitHub](https://github.com)");
  });

  it("exits with error if store fails to load", async () => {
    mockedLoadStore.mockImplementation(() => { throw new Error("store error"); });
    const mockExit = jest.spyOn(process, "exit").mockImplementation(() => { throw new Error("exit"); });
    const program = makeProgram();
    await expect(program.parseAsync(["node", "test", "export", "out.json"])).rejects.toThrow();
    expect(mockExit).toHaveBeenCalledWith(1);
    mockExit.mockRestore();
  });
});
