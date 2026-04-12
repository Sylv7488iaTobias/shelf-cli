import { Command } from "commander";
import { registerSyncCommand } from "./sync";
import * as syncModule from "../../sync/index";
import * as storeModule from "../../store/bookmarkStore";

function makeProgram(): Command {
  const program = new Command();
  program.exitOverride();
  registerSyncCommand(program);
  return program;
}

describe("sync command", () => {
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;
  let processExitSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    processExitSpy = jest
      .spyOn(process, "exit")
      .mockImplementation((() => {}) as () => never);
    jest
      .spyOn(storeModule, "getStorePath")
      .mockReturnValue("/tmp/test-shelf");
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should call syncBookmarks and log pulled/pushed messages", async () => {
    jest.spyOn(syncModule, "syncBookmarks").mockResolvedValue({
      pulled: true,
      pushed: true,
    });

    const program = makeProgram();
    await program.parseAsync(["node", "test", "sync"]);

    expect(syncModule.syncBookmarks).toHaveBeenCalledWith("/tmp/test-shelf", {
      pushOnly: false,
    });
    expect(consoleLogSpy).toHaveBeenCalledWith(
      "✓ Pulled latest changes from remote."
    );
    expect(consoleLogSpy).toHaveBeenCalledWith(
      "✓ Pushed local changes to remote."
    );
  });

  it("should log up to date when nothing changed", async () => {
    jest.spyOn(syncModule, "syncBookmarks").mockResolvedValue({
      pulled: false,
      pushed: false,
    });

    const program = makeProgram();
    await program.parseAsync(["node", "test", "sync"]);

    expect(consoleLogSpy).toHaveBeenCalledWith("✓ Already up to date.");
  });

  it("should initialize repo when --init flag is passed", async () => {
    jest.spyOn(syncModule, "ensureStoreIsRepo").mockResolvedValue(undefined);

    const program = makeProgram();
    await program.parseAsync(["node", "test", "sync", "--init"]);

    expect(syncModule.ensureStoreIsRepo).toHaveBeenCalledWith(
      "/tmp/test-shelf",
      undefined
    );
    expect(consoleLogSpy).toHaveBeenCalledWith("✓ Git repository initialized.");
  });

  it("should exit with code 1 on sync error", async () => {
    jest
      .spyOn(syncModule, "syncBookmarks")
      .mockRejectedValue(new Error("network error"));

    const program = makeProgram();
    await program.parseAsync(["node", "test", "sync"]);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Sync failed: network error"
    );
    expect(processExitSpy).toHaveBeenCalledWith(1);
  });
});
