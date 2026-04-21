import { Command } from "commander";
import { registerDueCommand } from "./due";

export function register(program: Command): void {
  registerDueCommand(program);
}
