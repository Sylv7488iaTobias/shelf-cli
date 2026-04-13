import { describe, it, expect } from "vitest";
import { Command } from "commander";
import { lintBookmarks, LintIssue } from "./lint";
import { registerLintCommand } from "./lint";

function makeBookmark(overrides: Partial<any> = {}): any {
  return {
    id: "abc123",
    title: "Example",
    url: "https://example.com",
    tags: [],
    folder: null,
    pinned: false,
    archived: false,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

function makeProgram() {
  const program = new Command();
  program.exitOverride();
  registerLintCommand(program);
  return program;
}

describe("lintBookmarks", () => {
  it("returns no issues for a valid bookmark", () => {
    const issues = lintBookmarks([makeBookmark()]);
    expect(issues).toHaveLength(0);
  });

  it("flags a bookmark with an empty URL", () => {
    const issues = lintBookmarks([makeBookmark({ url: "" })]);
    expect(issues.some((i: LintIssue) => i.field === "url")).toBe(true);
  });

  it("flags a bookmark with an invalid URL", () => {
    const issues = lintBookmarks([makeBookmark({ url: "not-a-url" })]);
    expect(issues.some((i: LintIssue) => i.message.includes("Invalid URL"))).toBe(true);
  });

  it("flags a bookmark with an empty title", () => {
    const issues = lintBookmarks([makeBookmark({ title: "" })]);
    expect(issues.some((i: LintIssue) => i.field === "title")).toBe(true);
  });

  it("flags a bookmark with duplicate tags", () => {
    const issues = lintBookmarks([makeBookmark({ tags: ["dev", "dev", "tools"] })]);
    expect(issues.some((i: LintIssue) => i.field === "tags")).toBe(true);
  });

  it("flags a bookmark with an overly long title", () => {
    const issues = lintBookmarks([makeBookmark({ title: "a".repeat(201) })]);
    expect(issues.some((i: LintIssue) => i.message.includes("200 characters"))).toBe(true);
  });

  it("returns multiple issues for a single bad bookmark", () => {
    const issues = lintBookmarks([makeBookmark({ url: "", title: "" })]);
    expect(issues.length).toBeGreaterThanOrEqual(2);
  });

  it("handles an empty bookmark list", () => {
    const issues = lintBookmarks([]);
    expect(issues).toHaveLength(0);
  });
});

describe("registerLintCommand", () => {
  it("registers the lint command", () => {
    const program = makeProgram();
    const cmd = program.commands.find((c) => c.name() === "lint");
    expect(cmd).toBeDefined();
  });

  it("lint command has --json option", () => {
    const program = makeProgram();
    const cmd = program.commands.find((c) => c.name() === "lint")!;
    const jsonOpt = cmd.options.find((o) => o.long === "--json");
    expect(jsonOpt).toBeDefined();
  });

  it("lint command has --fix option", () => {
    const program = makeProgram();
    const cmd = program.commands.find((c) => c.name() === "lint")!;
    const fixOpt = cmd.options.find((o) => o.long === "--fix");
    expect(fixOpt).toBeDefined();
  });
});
