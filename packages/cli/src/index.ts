#!/usr/bin/env node
import { VERSION } from "@textil/core";
import { Command } from "commander";
import { registerExport } from "./commands/export.js";
import { registerGenerate } from "./commands/generate.js";
import { registerInteractive } from "./commands/interactive.js";
import { registerText } from "./commands/text.js";

const program = new Command().name("textil").description("ASCII art generator").version(VERSION);

registerText(program);
registerGenerate(program);
registerExport(program);
registerInteractive(program);

await program.parseAsync(process.argv);
