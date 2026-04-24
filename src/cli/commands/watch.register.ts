import { Command } from "commander";
import { registerWatchCommand } from "./watch";

export function register(program: Command): void {
  registerWatchCommand(program);
}
