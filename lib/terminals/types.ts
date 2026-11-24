export type TerminalTone = "ok" | "warn" | "err" | "muted";

export interface TerminalOutputLine {
  text: string;
  tone?: TerminalTone;
}

export interface TerminalCommand {
  /** Stable id used by tasks and progress tracking. */
  id: string;
  /** The exact command a learner types or runs from the deck. */
  command: string;
  /** Extra spellings accepted by the simulator, including abbreviated flags. */
  aliases?: string[];
  /** One-line description shown in the command deck before it has been run. */
  summary: string;
  /** Simulated output. Strings render as plain terminal text. */
  output: Array<string | TerminalOutputLine>;
  /** A nudge shown by the hint button, not the full answer. */
  hint: string;
  /** Optional after-run explanation rendered beneath the output. */
  note?: string;
}

export interface TerminalTask {
  id: string;
  label: string;
  /** Every listed command id must run before the task is complete. */
  commands: string[];
}

export interface TerminalScript {
  slug: string;
  title: string;
  /** Toolchain or image the commands are written for. */
  environment: string;
  /** Prompt text, without the trailing space and dollar sign. */
  prompt: string;
  intro: string;
  /** Tool versions or binaries referenced by the script. */
  tools: string[];
  tasks: TerminalTask[];
  commands: TerminalCommand[];
  takeaway: string;
  safety?: string;
}
