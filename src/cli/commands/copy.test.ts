import { Command } from "commander";
import * as clipboardy from "clipboardy";
import { registerCopyCommand } from "./copy";
import * as bookmarkStore from "../../store/bookmarkStore";

jest.mock("clipboardy");
jest.mock("../../store/bookmarkStore");

function makeProgram(): Command {
  const program = new Command();
  program.exitOverride();
  registerCopyCommand(program);
  return program;
}

const mockStore = {
  bookmarks: [
    { name: "GitHub", url: "https://github.com", tags: [], pinned: false, createdAt: "2024-01-01" },
    { name: "OpenAI", url: "https://openai.com", tags: ["ai"], pinned: false, createdAt: "2024-01-02" },
  ],
};

beforeEach(() => {
  jest.clearAllMocks();
  (bookmarkStore.loadStore as jest.Mock).mockResolvedValue(mockStore);
  (clipboardy.write as jest.Mock).mockResolvedValue(undefined);
});

describe("copy command", () => {
  it("copies a bookmark URL to the clipboard", async () => {
    const program = makeProgram();
    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    await program.parseAsync(["node", "test", "copy", "GitHub"]);

    expect(clipboardy.write).toHaveBeenCalledWith("https://github.com");
    expect(consoleSpy).toHaveBeenCalledWith("Copied to clipboard: https://github.com");
    consoleSpy.mockRestore();
  });

  it("is case-insensitive when matching bookmark names", async () => {
    const program = makeProgram();
    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    await program.parseAsync(["node", "test", "copy", "openai"]);

    expect(clipboardy.write).toHaveBeenCalledWith("https://openai.com");
    consoleSpy.mockRestore();
  });

  it("exits with error when bookmark is not found", async () => {
    const program = makeProgram();
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    const exitSpy = jest.spyOn(process, "exit").mockImplementation((() => {}) as any);

    await program.parseAsync(["node", "test", "copy", "NonExistent"]);

    expect(errorSpy).toHaveBeenCalledWith('Bookmark "NonExistent" not found.');
    expect(exitSpy).toHaveBeenCalledWith(1);
    errorSpy.mockRestore();
    exitSpy.mockRestore();
  });

  it("passes store path option to loadStore", async () => {
    const program = makeProgram();
    jest.spyOn(console, "log").mockImplementation(() => {});

    await program.parseAsync(["node", "test", "copy", "GitHub", "--store", "/custom/path"]);

    expect(bookmarkStore.loadStore).toHaveBeenCalledWith("/custom/path");
  });

  it("does not write to clipboard when bookmark is not found", async () => {
    const program = makeProgram();
    jest.spyOn(console, "error").mockImplementation(() => {});
    jest.spyOn(process, "exit").mockImplementation((() => {}) as any);

    await program.parseAsync(["node", "test", "copy", "NonExistent"]);

    expect(clipboardy.write).not.toHaveBeenCalled();
  });
});
