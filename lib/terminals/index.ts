import type { TerminalScript } from "./types";
import { foundationsTerminals } from "./foundations";
import { applicationTerminals } from "./application";
import { operationsTerminals } from "./operations";
import { distributedTerminals } from "./distributed";
import { offensiveTerminals } from "./offensive";
import { forensicsTerminals } from "./forensics";
import { pqcTerminals } from "./pqc";

export type { TerminalCommand, TerminalOutputLine, TerminalScript, TerminalTask, TerminalTone } from "./types";

export const TERMINAL_SCRIPTS: TerminalScript[] = [
  ...foundationsTerminals,
  ...applicationTerminals,
  ...operationsTerminals,
  ...distributedTerminals,
  ...offensiveTerminals,
  ...forensicsTerminals,
  ...pqcTerminals,
].sort((a, b) => a.slug.localeCompare(b.slug));

for (const script of TERMINAL_SCRIPTS) {
  if (script.commands.length < 5) {
    throw new Error(`Terminal "${script.slug}" needs at least five commands.`);
  }
  const ids = new Set<string>();
  for (const command of script.commands) {
    if (ids.has(command.id)) {
      throw new Error(`Terminal "${script.slug}" has duplicate command id "${command.id}".`);
    }
    ids.add(command.id);
    if (!command.summary || !command.hint || command.output.length === 0) {
      throw new Error(`Terminal "${script.slug}" command "${command.id}" needs summary, hint and output.`);
    }
  }
  for (const task of script.tasks) {
    for (const id of task.commands) {
      if (!ids.has(id)) {
        throw new Error(`Terminal "${script.slug}" task "${task.id}" references unknown command "${id}".`);
      }
    }
  }
}

const REGISTRY = new Map(TERMINAL_SCRIPTS.map((script) => [script.slug, script]));

export function getTerminalScript(slug: string): TerminalScript | undefined {
  return REGISTRY.get(slug);
}

export interface TerminalSummary {
  slug: string;
  title: string;
  environment: string;
  commandCount: number;
  taskCount: number;
  tools: string[];
}

export const TERMINAL_SUMMARIES: TerminalSummary[] = TERMINAL_SCRIPTS.map((script) => ({
  slug: script.slug,
  title: script.title,
  environment: script.environment,
  commandCount: script.commands.length,
  taskCount: script.tasks.length,
  tools: script.tools,
}));
