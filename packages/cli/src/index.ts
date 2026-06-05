#!/usr/bin/env node
import { Command } from "commander";
import { VERSION } from "@textil/core";
import { registerText } from "./commands/text.js";
import { registerGenerate } from "./commands/generate.js";
import { registerExport } from "./commands/export.js";
import { registerInteractive } from "./commands/interactive.js";

const program = new Command()
  .name("textil")
  .description("ASCII art generator")
  .version(VERSION);

registerText(program);
registerGenerate(program);
registerExport(program);
registerInteractive(program);

await program.parseAsync(process.argv);
