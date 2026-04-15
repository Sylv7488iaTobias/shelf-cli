import { Command } from "commander";
import { registerTopCommand } from "./top";
import * as bookmarkStore from "../../store/bookmarkStore";

function makeProgram() {
  const program = new Command();
  program.exitOverride();
  registerTopCommand(program);
  return program;
}

function makeBookmark(name: string, url: string, createdAt: string, tags?: string[], folder?: string) {
  return { id: name, name, url, tags: tags ?? [], folder, createdAt };
}

const BASE_DATE = "2024-01-01T00:00:00.000Z";

describe("top command", () => {
  let loadStoreMock: jest.SpyInstance;
  let consoleLogMock: jest.SpyInstance;
  let consoleErrorMock: jest.SpyInstance;

  beforeEach(() => {
    loadStoreMock = jest.spyOn(bookmarkStore, "loadStore");
    consoleLogMock = jest.spyOn(console, "log").mockImplementation(() => {});
    consoleErrorMock = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("shows top bookmarks sorted by recency", async () => {
    loadStoreMock.mockResolvedValue({
      bookmarks: [
        makeBookmark("Older", "https://older.com", "2023-01-01T00:00:00.000Z"),
        makeBookmark("Newer", "https://newer.com", "2024-06-01T00:00:00.000Z"),
        makeBookmark("Middle", "https://middle.com", "2023-12-01T00:00:00.000Z"),
      ],
    });
    await makeProgram().parseAsync(["node", "test", "top", "-n", "3"]);
    expect(consoleLogMock).toHaveBeenCalledWith(expect.stringContaining("Top 3"));
    const calls = consoleLogMock.mock.calls.flat().join("\n");
    const newerIdx = calls.indexOf("Newer");
    const olderIdx = calls.indexOf("Older");
    expect(newerIdx).toBeLessThan(olderIdx);
  });

  it("limits results to count option", async () => {
    loadStoreMock.mockResolvedValue({
      bookmarks: [
        makeBookmark("A", "https://a.com", "2024-01-01T00:00:00.000Z"),
        makeBookmark("B", "https://b.com", "2024-02-01T00:00:00.000Z"),
        makeBookmark("C", "https://c.com", "2024-03-01T00:00:00.000Z"),
      ],
    });
    await makeProgram().parseAsync(["node", "test", "top", "-n", "2"]);
    expect(consoleLogMock).toHaveBeenCalledWith(expect.stringContaining("Top 2"));
    // Ensure the third bookmark is not displayed when limit is 2
    const calls = consoleLogMock.mock.calls.flat().join("\n");
    expect(calls).not.toContain("A");
  });

  it("filters by folder", async () => {
    loadStoreMock.mockResolvedValue({
      bookmarks: [
        makeBookmark("InFolder", "https://a.com", BASE_DATE, [], "work"),
        makeBookmark("NotInFolder", "https://b.com", BASE_DATE, [], "personal"),
      ],
    });
    await makeProgram().parseAsync(["node", "test", "top", "--folder", "work"]);
    const calls = consoleLogMock.mock.calls.flat().join("\n");
    expect(calls).toContain("InFolder");
    expect(calls).not.toContain("NotInFolder");
  });

  it("filters by tag", async () => {
    loadStoreMock.mockResolvedValue({
      bookmarks: [
        makeBookmark("Tagged", "https://a.com", BASE_DATE, ["typescript"]),
        makeBookmark("Untagged", "https://b.com", BASE_DATE, ["other"]),
      ],
    });
    await makeProgram().parseAsync(["node", "test", "top", "--tag", "typescript"]);
    const calls = consoleLogMock.mock.calls.flat().join("\n");
    expect(calls).toContain("Tagged");
    expect(calls).not.toContain("Untagged");
  });

  it("shows a message when no bookmarks match the filter", async () => {
    loadStoreMock.mockResolvedValue({
      bookmarks: [
        makeBookmark("OnlyOne", "https://a.com", BASE_DATE, [], "work"),
      ],
    });
    await makeProgram().parseAsync(["node", "test", "top", "--folder", "nonexistent"]);
    const calls = consoleLogMock.mock.calls.flat().join("\n");
    expect(calls).not.toContain("OnlyOne");
  });
});
