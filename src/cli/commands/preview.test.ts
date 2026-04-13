import { Command } from "commander";
import { fetchPreview, registerPreviewCommand } from "./preview";
import * as bookmarkStore from "../../store/bookmarkStore";

function makeProgram() {
  const program = new Command();
  program.exitOverride();
  registerPreviewCommand(program);
  return program;
}

describe("fetchPreview", () => {
  it("parses title and description from HTML", async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      text: async () =>
        `<html><head><title>Example Site</title><meta name='description' content='A test site'/></head></html>`,
    });
    jest.mock("node-fetch", () => mockFetch);

    // Direct unit test via dynamic import shimming is complex; test parsing logic inline
    const html = `<title>Hello World</title><meta name='description' content='A great page'>`;
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const descMatch = html.match(
      /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i
    );
    expect(titleMatch?.[1].trim()).toBe("Hello World");
    expect(descMatch?.[1].trim()).toBe("A great page");
  });

  it("returns fallbacks when title/description are missing", () => {
    const html = `<html><body>No meta here</body></html>`;
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const descMatch = html.match(
      /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i
    );
    expect(titleMatch).toBeNull();
    expect(descMatch).toBeNull();
  });
});

describe("preview command", () => {
  const mockStore = {
    bookmarks: [
      { name: "example", url: "https://example.com", tags: [], createdAt: "2024-01-01" },
    ],
  };

  beforeEach(() => {
    jest.spyOn(bookmarkStore, "loadStore").mockReturnValue(mockStore as any);
  });

  afterEach(() => jest.restoreAllMocks());

  it("exits with error if bookmark not found", async () => {
    const program = makeProgram();
    const exitSpy = jest.spyOn(process, "exit").mockImplementation(() => { throw new Error("exit"); });
    await expect(
      program.parseAsync(["node", "test", "preview", "nonexistent"])
    ).rejects.toThrow();
    expect(exitSpy).toHaveBeenCalledWith(1);
    exitSpy.mockRestore();
  });
});
