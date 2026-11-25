"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  CheckCircle2,
  Circle,
  Copy,
  CornerDownLeft,
  FileText,
  Folder,
  Lightbulb,
  Play,
  RotateCcw,
  TerminalSquare,
  TriangleAlert,
} from "lucide-react";
import {
  createShellState,
  executeShell,
  listLabEntries,
  materializeArtifacts,
  SHELL_COMMANDS,
  type LinuxLabFixture,
  type ShellLine,
  type ShellState,
  type ShellTone,
} from "@/lib/linuxTerminal/engine";
import { getLinuxLab, SHELL_SKILLS } from "@/lib/linuxTerminal/fixtures";
import { getTerminalScript, type TerminalScript } from "@/lib/terminals";

interface Entry {
  key: number;
  kind: "sys" | "cmd" | "out";
  text?: string;
  tone?: ShellTone;
  command?: string;
  prompt?: string;
}

const TONE_CLASS: Record<ShellTone | "default", string> = {
  default: "text-[#E9E6F4]",
  muted: "text-[#A7A3B8]",
  ok: "text-emerald-300",
  warn: "text-amber-300",
  err: "text-rose-300",
};

const normalize = (value: string) => value.trim().replace(/\s+/g, " ");

function promptFor(state: ShellState): string {
  const cwd = state.cwd === state.home ? "~" : `~${state.cwd.slice(state.home.length)}`;
  return `${state.user}@${state.hostname}:${cwd}$`;
}

function OutputLine({ line }: { line: ShellLine }) {
  return (
    <div className={`whitespace-pre-wrap break-words font-mono text-[11px] leading-5 ${TONE_CLASS[line.tone ?? "default"]}`}>
      {line.text || "\u00A0"}
    </div>
  );
}

export function LinuxTerminal({ slug }: { slug: string }) {
  const lab = getLinuxLab(slug);
  const script = getTerminalScript(slug);
  if (!lab || !script) {
    return (
      <div className="not-prose my-8 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4">
        <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
        <p className="text-sm leading-6 text-rose-900">
          No practice-shell fixture is registered for <code className="font-mono">{slug}</code>. Add one in{" "}
          <code className="font-mono">lib/linuxTerminal/fixtures.ts</code>.
        </p>
      </div>
    );
  }
  return <LinuxTerminalInner lab={lab} script={script} />;
}

function LinuxTerminalInner({ lab, script }: { lab: LinuxLabFixture; script: TerminalScript }) {
  const [shellState, setShellState] = useState<ShellState>(() => createShellState(lab));
  const [entries, setEntries] = useState<Entry[]>(() => [
    { key: 1, kind: "sys", text: `Inert Linux shell ready · ${lab.intro ?? script.title}` },
    { key: 2, kind: "sys", text: "Type `help` for builtins, or start with pwd and ls -la." },
    { key: 3, kind: "sys", text: "Course tools are pre-scripted; builtins operate on this virtual filesystem." },
  ]);
  const [value, setValue] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [skills, setSkills] = useState<string[]>([]);
  const [courseCommands, setCourseCommands] = useState<string[]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const keyRef = useRef(3);
  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const nextKey = () => {
    keyRef.current += 1;
    return keyRef.current;
  };

  const entriesFor = (): Entry[] => [
    { key: nextKey(), kind: "sys", text: `Inert Linux shell ready · ${lab.intro ?? script.title}` },
    { key: nextKey(), kind: "sys", text: "Type `help` for builtins, or start with pwd and ls -la." },
    { key: nextKey(), kind: "sys", text: "Course tools are pre-scripted; builtins operate on this virtual filesystem." },
  ];

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [entries]);

  const pathEntries = useMemo(() => listLabEntries(shellState), [shellState]);
  const nextCourseCommand = script.commands.find((command) => !courseCommands.includes(command.id));
  const firstFile = Object.keys(lab.files)[0] ?? "README.txt";
  const suggestions = [
    { command: "pwd", label: "Show the working directory" },
    { command: "ls -la", label: "List the lab, including hidden entries" },
    { command: `cat ${firstFile}`, label: "Read the first fixture" },
    { command: `sha256sum ${firstFile}`, label: "Hash a virtual file" },
    { command: `grep demo ${firstFile}`, label: "Search for a teaching keyword" },
    { command: 'echo "practice note" > notes.txt && cat notes.txt', label: "Create and read a file" },
  ];

  function append(lines: Omit<Entry, "key">[]) {
    setEntries((current) => [...current, ...lines.map((line) => ({ ...line, key: nextKey() }))]);
  }

  function resetLab() {
    setShellState(createShellState(lab));
    setEntries(entriesFor());
    setValue("");
    setHistory([]);
    setHistoryIndex(-1);
    setSkills([]);
    setCourseCommands([]);
  }

  function execute(raw: string) {
    const command = raw.trim();
    if (!command) return;
    const prompt = promptFor(shellState);
    setHistory((current) => [...current, command]);
    setHistoryIndex(-1);
    setValue("");

    const normalized = normalize(command);
    if (normalized === "clear" || normalized === "cls") {
      setEntries([]);
      return;
    }
    if (normalized === "reset") {
      resetLab();
      return;
    }
    if (normalized === "history") {
      append([
        { kind: "cmd", command, prompt },
        ...[...history, command].map((item, index) => ({ kind: "out" as const, text: `${String(index + 1).padStart(4)}  ${item}` })),
      ]);
      return;
    }

    const courseMatch = script.commands.find(
      (item) =>
        normalize(item.command) === normalized ||
        (item.aliases ?? []).some((alias) => normalize(alias) === normalized),
    );

    if (courseMatch) {
      const output: ShellLine[] = courseMatch.output.map((line) =>
        typeof line === "string" ? { text: line } : { text: line.text, tone: line.tone },
      );
      const nextState = materializeArtifacts(shellState, courseMatch.command, output);
      append([
        { kind: "cmd", command, prompt },
        ...output.map((line) => ({ kind: "out" as const, text: line.text, tone: line.tone })),
        ...(courseMatch.note ? [{ kind: "sys" as const, text: `↳ ${courseMatch.note}` }] : []),
        { kind: "sys" as const, text: "Guided course tool finished. Any output files are inert placeholders in the virtual filesystem.", tone: "muted" },
      ]);
      setShellState(nextState);
      setCourseCommands((current) => (current.includes(courseMatch.id) ? current : [...current, courseMatch.id]));
      setSkills((current) => (current.includes("inspect") ? current : [...current, "inspect"]));
      return;
    }

    const firstToken = normalized.split(" ")[0];
    const related = script.commands.filter((item) => item.command.startsWith(`${firstToken} `)).slice(0, 2);
    if (related.length) {
      append([
        { kind: "cmd", command, prompt },
        { kind: "out", text: `This course tool is simulated. No process was started.`, tone: "warn" },
        { kind: "out", text: "Use one of the exact guided invocations:", tone: "muted" },
        ...related.map((item) => ({ kind: "out" as const, text: `  ${item.command}`, tone: "muted" as const })),
      ]);
      return;
    }

    const result = executeShell(command, shellState);
    if (result.clear) {
      setEntries([]);
    } else {
      const silentNoMatch = result.exitCode === 1 && result.lines.length === 0 && firstToken === "grep";
      append([
        { kind: "cmd", command, prompt },
        ...result.lines.map((line) => ({ kind: "out" as const, text: line.text, tone: line.tone })),
        ...(silentNoMatch ? [{ kind: "out" as const, text: "(no matches)", tone: "muted" as const }] : []),
        ...(firstToken === "help"
          ? [{ kind: "sys" as const, text: `Course tools in this lab: ${script.tools.join(", ")}. Their exact invocations are in the guided terminal above.`, tone: "muted" as const }]
          : []),
      ]);
    }
    setShellState(result.state);
    setSkills((current) => [...new Set([...current, ...result.skills])]);
  }

  function insertCommand(command: string) {
    setValue(command);
    inputRef.current?.focus();
  }

  async function copyCommand(command: string) {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(command);
      window.setTimeout(() => setCopied((current) => (current === command ? null : current)), 1400);
    } catch {
      setCopied(null);
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!history.length) return;
      const nextIndex = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIndex);
      setValue(history[nextIndex]);
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (historyIndex === -1) return;
      const nextIndex = historyIndex + 1;
      if (nextIndex >= history.length) {
        setHistoryIndex(-1);
        setValue("");
      } else {
        setHistoryIndex(nextIndex);
        setValue(history[nextIndex]);
      }
      return;
    }
    if (event.key !== "Tab" || !value.trim()) return;

    const candidates = value.includes(" ")
      ? pathEntries.map((entry) => entry.path)
      : [...SHELL_COMMANDS, ...script.commands.map((command) => command.command)];
    const lastSpace = value.lastIndexOf(" ");
    const prefix = value.slice(lastSpace + 1);
    const match = candidates.find((candidate) => candidate.startsWith(prefix));
    if (match) {
      event.preventDefault();
      setValue(`${value.slice(0, lastSpace + 1)}${match}`);
    }
  }

  return (
    <section
      id={`linux-terminal-${lab.slug}`}
      className="not-prose my-8 scroll-mt-40 overflow-hidden rounded-2xl border border-line bg-white shadow-card"
      aria-label="Interactive Linux terminal"
    >
      <div className="flex flex-col gap-3 border-b border-line bg-mist-50/80 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.14em] text-brand-700">
            <TerminalSquare className="h-3.5 w-3.5" /> practice shell · linux simulation
          </p>
          <h3 className="mt-1 text-sm font-bold text-navy">Test the commands on an inert lab filesystem</h3>
          <p className="mt-0.5 font-mono text-[10px] leading-4 text-muted">
            {lab.user}@{lab.hostname} · ~/lab · bash
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.08em] text-emerald-700">
            local simulation · nothing executes
          </span>
          <span className="font-mono text-[10px] font-bold text-brand-700">
            {skills.length}/{SHELL_SKILLS.length} skills
          </span>
          <button
            type="button"
            onClick={resetLab}
            className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.08em] text-muted hover:border-brand-200 hover:text-brand-700"
          >
            <RotateCcw className="h-3 w-3" /> Reset lab
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[minmax(0,1.25fr)_minmax(290px,0.75fr)]">
        <div className="bg-navy p-3 sm:p-4">
          <div className="mb-2 flex items-center justify-between gap-2 rounded-lg bg-white/5 px-2.5 py-1.5">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-rose-400" />
              <span className="h-2 w-2 rounded-full bg-amber-300" />
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
            </div>
            <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-[#A7A3B8]">
              {lab.user}@{lab.hostname}:~/lab
            </span>
          </div>

          <div
            ref={logRef}
            role="log"
            aria-live="polite"
            aria-label={`${lab.slug} Linux practice shell output`}
            className="h-[420px] overflow-y-auto rounded-lg bg-[#0E012E] p-3 font-mono text-[11px] leading-5"
          >
            {entries.map((entry) => {
              if (entry.kind === "cmd") {
                return (
                  <div key={entry.key} className="mt-2 break-words">
                    <span className="text-[#BCA8FF]">{entry.prompt}</span>{" "}
                    <span className="text-white">{entry.command}</span>
                  </div>
                );
              }
              if (entry.kind === "sys") {
                return (
                  <div key={entry.key} className={`mt-1.5 whitespace-pre-wrap break-words font-mono text-[10px] leading-4 ${TONE_CLASS[entry.tone ?? "muted"]}`}>
                    {entry.text}
                  </div>
                );
              }
              return <OutputLine key={entry.key} line={{ text: entry.text ?? "", tone: entry.tone }} />;
            })}
          </div>

          <form
            className="mt-2 flex items-center gap-2 rounded-lg border border-white/10 bg-[#0E012E] px-3 py-2"
            onSubmit={(event) => {
              event.preventDefault();
              execute(value);
            }}
          >
            <label htmlFor={`linux-terminal-input-${lab.slug}`} className="sr-only">
              Linux terminal command
            </label>
            <span className="shrink-0 font-mono text-[10px] text-[#BCA8FF]">{promptFor(shellState)}</span>
            <input
              ref={inputRef}
              id={`linux-terminal-input-${lab.slug}`}
              value={value}
              onChange={(event) => setValue(event.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              placeholder="type a command; Tab completes files and commands"
              className="min-w-0 flex-1 bg-transparent font-mono text-[11px] text-white placeholder:text-[#6F6B85] focus:outline-none"
            />
            <button
              type="submit"
              aria-label="Run Linux shell command"
              className="inline-flex shrink-0 items-center gap-1 rounded-md border border-white/15 bg-white/10 px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.08em] text-[#E9E6F4] hover:bg-white/20"
            >
              <CornerDownLeft className="h-3 w-3" /> run
            </button>
          </form>

          <div className="mt-2 flex flex-wrap gap-1.5" aria-label="Linux shell shortcuts">
            {["help", "history", "clear", "reset"].map((shortcut) => (
              <button
                key={shortcut}
                type="button"
                onClick={() => execute(shortcut)}
                className="rounded border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[9px] text-[#A7A3B8] hover:bg-white/10 hover:text-white"
              >
                {shortcut}
              </button>
            ))}
            <span className="rounded border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[9px] text-[#6F6B85]">↑ ↓ history</span>
            <span className="rounded border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[9px] text-[#6F6B85]">Tab complete</span>
            <span className="rounded border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[9px] text-[#6F6B85]">| &gt; &gt;&gt;</span>
          </div>
        </div>

        <aside className="border-t border-line p-4 lg:border-l lg:border-t-0">
          <div>
            <div className="flex items-center justify-between gap-2">
              <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted">Shell skills</p>
              <span className="font-mono text-[9px] font-bold text-brand-700">
                {Math.round((skills.length / SHELL_SKILLS.length) * 100)}%
              </span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-mist-200">
              <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-coral-400 transition-all" style={{ width: `${(skills.length / SHELL_SKILLS.length) * 100}%` }} />
            </div>
            <ul className="mt-3 grid grid-cols-2 gap-1.5">
              {SHELL_SKILLS.map((skill) => {
                const complete = skills.includes(skill.id);
                return (
                  <li key={skill.id} className={`rounded-lg border px-2.5 py-2 ${complete ? "border-emerald-200 bg-emerald-50" : "border-line bg-white"}`}>
                    <p className={`inline-flex items-center gap-1 text-[10px] font-semibold ${complete ? "text-emerald-800" : "text-body"}`}>
                      {complete ? <CheckCircle2 className="h-3 w-3" /> : <Circle className="h-3 w-3 text-muted" />}
                      {skill.label}
                    </p>
                    <p className="mt-0.5 font-mono text-[8px] text-muted">{skill.detail}</p>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="mt-4 rounded-xl border border-brand-200 bg-brand-50/70 p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-brand-700">
                <Lightbulb className="h-3 w-3" /> next course command
              </p>
              <span className="font-mono text-[9px] text-brand-700">
                {courseCommands.length}/{script.commands.length}
              </span>
            </div>
            {nextCourseCommand ? (
              <>
                <code className="mt-2 block break-words font-mono text-[10px] leading-4 text-navy">{nextCourseCommand.command}</code>
                <div className="mt-2 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => insertCommand(nextCourseCommand.command)}
                    className="inline-flex items-center gap-1 rounded-md border border-brand-200 bg-white px-2 py-1 text-[9px] font-bold uppercase tracking-[0.06em] text-brand-700 hover:border-brand-300"
                  >
                    <CornerDownLeft className="h-2.5 w-2.5" /> insert
                  </button>
                  <button
                    type="button"
                    onClick={() => copyCommand(nextCourseCommand.command)}
                    className="inline-flex items-center gap-1 rounded-md border border-brand-200 bg-white px-2 py-1 text-[9px] font-bold uppercase tracking-[0.06em] text-brand-700"
                  >
                    {copied === nextCourseCommand.command ? <Check className="h-2.5 w-2.5" /> : <Copy className="h-2.5 w-2.5" />}
                    {copied === nextCourseCommand.command ? "copied" : "copy"}
                  </button>
                  <button
                    type="button"
                    onClick={() => execute(nextCourseCommand.command)}
                    className="inline-flex items-center gap-1 rounded-md border border-brand-300 bg-brand-100 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.06em] text-brand-700"
                  >
                    <Play className="h-2.5 w-2.5" /> run
                  </button>
                </div>
              </>
            ) : (
              <p className="mt-2 text-[10px] leading-5 text-emerald-900">
                Every guided course command has run in this practice shell. Try the builtins next.
              </p>
            )}
          </div>

          <div className="mt-4">
            <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted">Virtual files</p>
            <div className="mt-2 max-h-[180px] space-y-1 overflow-y-auto pr-1">
              {pathEntries.map((entry) => (
                <button
                  key={entry.path}
                  type="button"
                  onClick={() => insertCommand(`${entry.type === "dir" ? "ls" : "cat"} ${entry.path}`)}
                  className="flex w-full items-center gap-2 rounded-lg border border-line bg-mist-50 px-2.5 py-1.5 text-left font-mono text-[9px] text-body hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
                  aria-label={`${entry.type === "dir" ? "List" : "Read"} ${entry.path}`}
                >
                  {entry.type === "dir" ? <Folder className="h-3 w-3 shrink-0 text-brand-600" /> : <FileText className="h-3 w-3 shrink-0 text-muted" />}
                  <span className="truncate">{entry.path}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted">Try a shell skill</p>
            <div className="mt-2 space-y-1.5">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion.command}
                  type="button"
                  onClick={() => execute(suggestion.command)}
                  className="flex w-full items-start gap-2 rounded-lg border border-line bg-white px-2.5 py-2 text-left hover:border-brand-200"
                >
                  <Play className="mt-0.5 h-3 w-3 shrink-0 text-brand-600" />
                  <span>
                    <span className="block font-mono text-[9px] font-semibold text-navy">{suggestion.command}</span>
                    <span className="mt-0.5 block text-[9px] leading-4 text-muted">{suggestion.label}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <div className="border-t border-line bg-mist-50/70 px-4 py-3 text-[10px] leading-5 text-muted sm:px-5">
        <strong className="font-semibold text-navy">Inert simulation.</strong>{" "}
        No command starts a process, opens a socket or touches your machine. Builtins operate on the virtual
        filesystem above; course tools replay their pre-scripted output and create placeholder artifacts. Use a
        real isolated VM or container when you are ready to run the commands for yourself.
      </div>
    </section>
  );
}
