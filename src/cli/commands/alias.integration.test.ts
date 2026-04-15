import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";
import { Command } from "commander";
import { registerAliasCommand } from "./alias";

async function makeTempStore() {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "shelf-alias-"));
  const storePath = path.join(dir, "bookmarks.json");
  const bookmark = {
    id: "id1",
    url: "https://integration.test",
    title: "Integration",
    tags: [],
    createdAt: new Date().toISOString(),
  };
  await fs.writeFile(storePath, JSON.stringify({ bookmarks: [bookmark] }), "utf-8");
  return { dir, storePath };
}

function makeProgram(storePath: string) {
  const program = new Command();
  program.exitOverride();
  registerAliasCommand(program);
  return { program, storePath };
}

test("full alias lifecycle: set, get, list, remove", async () => {
  const { storePath } = await makeTempStore();
  const { program } = makeProgram(storePath);

  const logs: string[] = [];
  const spy = jest.spyOn(console, "log").mockImplementation((msg) => logs.push(msg));

  await program.parseAsync(["node", "shelf", "alias", "set", "int", "id1", "-s", storePath]);
  expect(logs.some((l) => l.includes("int"))).toBe(true);

  logs.length = 0;
  await program.parseAsync(["node", "shelf", "alias", "get", "int", "-s", storePath]);
  expect(logs.some((l) => l.includes("https://integration.test"))).toBe(true);

  logs.length = 0;
  await program.parseAsync(["node", "shelf", "alias", "list", "-s", storePath]);
  expect(logs.some((l) => l.includes("int"))).toBe(true);

  logs.length = 0;
  await program.parseAsync(["node", "shelf", "alias", "remove", "int", "-s", storePath]);
  expect(logs.some((l) => l.includes("Removed alias"))).toBe(true);

  logs.length = 0;
  await program.parseAsync(["node", "shelf", "alias", "list", "-s", storePath]);
  expect(logs.some((l) => l.includes("No aliases defined"))).toBe(true);

  spy.mockRestore();
});
