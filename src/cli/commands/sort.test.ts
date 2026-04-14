import { Command } from "commander";
import { sortBookmarks, registerSortCommand, SortField } from "./sort";
import { Bookmark } from "../../store/bookmarkStore";

function makeBookmark(overrides: Partial<Bookmark> = {}): Bookmark {
  return {
    id: Math.random().toString(36).slice(2),
    title: "Test",
    url: "https://example.com",
    tags: [],
    folder: "",
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

function makeProgram() {
  const program = new Command();
  program.exitOverride();
  registerSortCommand(program);
  return program;
}

describe("sortBookmarks", () => {
  const bookmarks = [
    makeBookmark({ title: "Zebra", url: "https://z.com", createdAt: "2024-03-01T00:00:00Z" }),
    makeBookmark({ title: "Apple", url: "https://a.com", createdAt: "2024-01-01T00:00:00Z" }),
    makeBookmark({ title: "Mango", url: "https://m.com", createdAt: "2024-02-01T00:00:00Z" }),
  ];

  it("sorts by title ascending", () => {
    const result = sortBookmarks(bookmarks, "title", "asc");
    expect(result.map((b) => b.title)).toEqual(["Apple", "Mango", "Zebra"]);
  });

  it("sorts by title descending", () => {
    const result = sortBookmarks(bookmarks, "title", "desc");
    expect(result.map((b) => b.title)).toEqual(["Zebra", "Mango", "Apple"]);
  });

  it("sorts by url ascending", () => {
    const result = sortBookmarks(bookmarks, "url", "asc");
    expect(result.map((b) => b.url)).toEqual(["https://a.com", "https://m.com", "https://z.com"]);
  });

  it("sorts by createdAt ascending", () => {
    const result = sortBookmarks(bookmarks, "createdAt", "asc");
    expect(result[0].createdAt).toBe("2024-01-01T00:00:00Z");
    expect(result[2].createdAt).toBe("2024-03-01T00:00:00Z");
  });

  it("does not mutate the original array", () => {
    const original = [...bookmarks];
    sortBookmarks(bookmarks, "title", "asc");
    expect(bookmarks).toEqual(original);
  });
});

describe("sort command", () => {
  it("exits with error for invalid field", () => {
    const program = makeProgram();
    const exitSpy = jest.spyOn(process, "exit").mockImplementation(() => { throw new Error("exit"); });
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    expect(() => program.parse(["node", "test", "sort", "--field", "invalid"])).toThrow();
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining("Invalid field"));
    exitSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it("exits with error for invalid order", () => {
    const program = makeProgram();
    const exitSpy = jest.spyOn(process, "exit").mockImplementation(() => { throw new Error("exit"); });
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    expect(() => program.parse(["node", "test", "sort", "--order", "random"])).toThrow();
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining("Invalid order"));
    exitSpy.mockRestore();
    errorSpy.mockRestore();
  });
});
