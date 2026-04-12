export { isGitRepo, initGitRepo, commitChanges, pushChanges, pullChanges, syncStore } from "./gitSync";
export type { SyncOptions } from "./gitSync";

import { getStorePath } from "../store/bookmarkStore";
import { initGitRepo, commitChanges, syncStore } from "./gitSync";
import type { SyncOptions } from "./gitSync";

/**
 * Ensures the bookmark store directory is a git repository.
 * Safe to call on every startup.
 */
export function ensureStoreIsRepo(): void {
  const storePath = getStorePath();
  initGitRepo(storePath);
}

/**
 * Commits any pending changes to the bookmark store with a standard message.
 */
export function commitBookmarkChanges(message = "chore: update bookmarks"): void {
  const storePath = getStorePath();
  commitChanges(storePath, message);
}

/**
 * Pulls and pushes the bookmark store to/from the configured remote.
 * Requires the store to already have a remote configured via `git remote add`.
 */
export function syncBookmarks(remote = "origin", branch = "main"): void {
  const storePath = getStorePath();
  const opts: SyncOptions = { storePath, remote, branch };
  syncStore(opts);
}
