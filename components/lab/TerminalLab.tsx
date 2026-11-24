"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  CheckCircle2,
  Circle,
  Copy,
  CornerDownLeft,
  Lightbulb,
  Play,
  RotateCcw,
  TerminalSquare,
  TriangleAlert,
} from "lucide-react";
import {
  getTerminalScript,
  type TerminalCommand,
  type TerminalOutputLine,
  type TerminalScript,
  type TerminalTask,
  type TerminalTone,
} from "@/lib/terminals";

interface Entry {
  key: number;
  kind: "sys" | "cmd" | "out";
  text?: string;
  tone?: TerminalTone;
  command?: string;
}

const TONE_CLASS: Record<TerminalTone | "default", string> = {
  default: "text-[#E9E6F4]",
  muted: "text-[#A7A3B8]",
  ok: "text-emerald-300",
  warn: "text-amber-300",
  err: "text-rose-300",
};

const normalize = (value: string) => value.trim().replace(/\s+/g, " ");

function isTaskDone(task: TerminalTask, done: string[]) {
  return task.commands.every((id) => done.includes(id));
}

function OutputLine({ line }: { line: TerminalOutputLine }) {
  return (
    <div className={`whitespace-pre-wrap break-words font-mono text-[11px] leading-5 ${TONE_CLASS[line.tone ?? "default"]}`}>
      {line.text || "\u00A0"}
    </div>
  );
}

function firstIncompleteCommand(script: TerminalScript, done: string[]): TerminalCommand | undefined {
  for (const task of script.tasks) {
    for (const id of task.commands) {
      if (!done.includes(id)) {
        const command = script.commands.find((item) => item.id === id);
        if (command) return command;
      }
    }
  }
  return undefined;
}

export function TerminalLab({ slug }: { slug: string }) {
  const script = getTerminalScript(slug);
  if (!script) {
    return (
      <div className="not-prose my-8 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4">
        <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
        <p className="text-sm leading-6 text-rose-900">
          No terminal script is registered for <code className="font-mono">{slug}</code>. Add one in{" "}
          <code className="font-mono">lib/terminals</code> before publishing this module.
        </p>
      </div>
    );
  }
  return <TerminalLabInner script={script} />;
}

function TerminalLabInner({ script }: { script: TerminalScript }) {
  const [entries, setEntries] = useState<Entry[]>(() => [
    { key: 1, kind: "sys", text: `Simulated shell ready · ${script.environment}` },
    { key: 2, kind: "sys", text: "Run a command from the deck, or type `help` for terminal shortcuts." },
  ]);
  const [value, setValue] = useState("");
  const [done, setDone] = useState<string[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [hintedId, setHintedId] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const keyRef = useRef(2);
  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const nextKey = () => {
    keyRef.current += 1;
    return keyRef.current;
  };

  const welcome = (): Entry[] => [
    { key: nextKey(), kind: "sys", text: `Simulated shell ready · ${script.environment}` },
    { key: nextKey(), kind: "sys", text: "Run a command from the deck, or type `help` for terminal shortcuts." },
  ];

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [entries]);

  const completedTasks = useMemo(
    () => script.tasks.filter((task) => isTaskDone(task, done)).length,
    [script.tasks, done],
  );
  const progress = script.tasks.length ? Math.round((completedTasks / script.tasks.length) * 100) : 0;
  const allDone = completedTasks === script.tasks.length;
  const hintCommand = hintedId ? script.commands.find((command) => command.id === hintedId) : undefined;

  function append(lines: Omit<Entry, "key">[]) {
    setEntries((current) => [...current, ...lines.map((line) => ({ ...line, key: nextKey() }))]);
  }

  function runCommand(command: TerminalCommand) {
    const nextDone = done.includes(command.id) ? done : [...done, command.id];
    const newlyCompleted = script.tasks.filter((task) => !isTaskDone(task, done) && isTaskDone(task, nextDone));

    append([
      { kind: "cmd", command: command.command },
      ...command.output.map((line) => ({
        kind: "out" as const,
        text: typeof line === "string" ? line : line.text,
        tone: typeof line === "string" ? undefined : line.tone,
      })),
      ...(command.note ? [{ kind: "sys" as const, text: `↳ ${command.note}` }] : []),
      ...newlyCompleted.map((task) => ({
        kind: "sys" as const,
        text: `✓ task complete: ${task.label}`,
        tone: "ok" as const,
      })),
    ]);
    setDone(nextDone);
    setHintedId(null);
  }

  function submit(raw: string) {
    const command = raw.trim();
    if (!command) return;
    setHistory((current) => [...current, command]);
    setHistoryIndex(-1);
    setValue("");

    const normalized = normalize(command);
    if (normalized === "clear" || normalized === "cls") {
      setEntries([]);
      return;
    }
    if (normalized === "reset") {
      setDone([]);
      setHintedId(null);
      setEntries(welcome());
      return;
    }
    if (normalized === "help" || normalized === "?") {
      append([
        { kind: "cmd", command },
        { kind: "out", text: "Terminal shortcuts:" },
        { kind: "out", text: "  help          list shortcuts" },
        { kind: "out", text: "  tasks         show task progress" },
        { kind: "out", text: "  hint          reveal a nudge for the next task" },
        { kind: "out", text: "  clear         clear the screen" },
        { kind: "out", text: "  reset         clear the screen and task progress" },
        { kind: "out", text: "  ↑ / ↓         browse command history" },
        { kind: "out", text: "  Tab           complete a command from the deck", tone: "muted" },
        { kind: "out", text: "Every command in the deck is also a button you can run directly.", tone: "muted" },
      ]);
      return;
    }
    if (normalized === "tasks") {
      append([
        { kind: "cmd", command },
        ...script.tasks.map((task) => ({
          kind: "out" as const,
          text: `${isTaskDone(task, done) ? "✓" : "○"} ${task.label}`,
          tone: isTaskDone(task, done) ? ("ok" as const) : undefined,
        })),
      ]);
      return;
    }
    if (normalized === "hint" || normalized === "hints") {
      const next = firstIncompleteCommand(script, done);
      if (!next) {
        append([{ kind: "cmd", command }, { kind: "out", text: "All tasks are complete. Try reset to run the lab again.", tone: "ok" }]);
      } else {
        setHintedId(next.id);
        append([{ kind: "cmd", command }, { kind: "out", text: `Hint: ${next.hint}`, tone: "warn" }]);
      }
      return;
    }

    const match = script.commands.find(
      (item) =>
        normalize(item.command) === normalized ||
        (item.aliases ?? []).some((alias) => normalize(alias) === normalized),
    );

    if (match) {
      runCommand(match);
      return;
    }

    const firstToken = normalized.split(" ")[0];
    const suggestions = script.commands
      .filter((item) => item.command.startsWith(firstToken))
      .slice(0, 3)
      .map((item) => item.command);

    append([
      { kind: "cmd", command },
      { kind: "out", text: `command not found: ${firstToken}`, tone: "err" },
      {
        kind: "out",
        text: suggestions.length
          ? `did you mean: ${suggestions.join("  |  ")}`
          : "Type `help` for shortcuts and use the command deck on the right.",
        tone: "muted",
      },
    ]);
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
    if (event.key === "Tab" && value.trim()) {
      const match = script.commands.find((command) => command.command.startsWith(value.trim()));
      if (match) {
        event.preventDefault();
        setValue(match.command);
      }
    }
  }

  return (
    <section
      id={`terminal-${script.slug}`}
      className="not-prose my-10 scroll-mt-40 overflow-hidden rounded-2xl border border-line bg-white shadow-card"
      aria-label="Interactive terminal lab"
    >
      <div className="flex flex-col gap-3 border-b border-line bg-mist-50/80 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.14em] text-brand-700">
            <TerminalSquare className="h-3.5 w-3.5" /> interactive terminal
          </p>
          <h3 className="mt-1 text-sm font-bold text-navy">{script.title}</h3>
          <p className="mt-0.5 text-[10px] leading-4 text-muted">{script.environment}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.08em] text-amber-700">
            simulated · nothing executes
          </span>
          <span className="font-mono text-[10px] font-bold text-brand-700">
            {completedTasks}/{script.tasks.length} tasks
          </span>
          <button
            type="button"
            onClick={() => {
              setDone([]);
              setHintedId(null);
              setEntries(welcome());
              setValue("");
              setHistoryIndex(-1);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.08em] text-muted hover:border-brand-200 hover:text-brand-700"
          >
            <RotateCcw className="h-3 w-3" /> Reset
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
              {script.prompt} · bash
            </span>
          </div>

          <div
            ref={logRef}
            role="log"
            aria-live="polite"
            aria-label={`${script.title} terminal output`}
            className="h-[360px] overflow-y-auto rounded-lg bg-[#0E012E] p-3 font-mono text-[11px] leading-5"
          >
            <p className="text-[10px] leading-4 text-[#A7A3B8]">{script.intro}</p>
            <div className="my-2 h-px bg-white/10" />
            {entries.map((entry) => {
              if (entry.kind === "cmd") {
                return (
                  <div key={entry.key} className="mt-2 break-words">
                    <span className="text-[#BCA8FF]">{script.prompt} ~ $</span>{" "}
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
              submit(value);
            }}
          >
            <label htmlFor={`terminal-input-${script.slug}`} className="sr-only">
              Terminal command
            </label>
            <span className="shrink-0 font-mono text-[10px] text-[#BCA8FF]">{script.prompt} ~ $</span>
            <input
              ref={inputRef}
              id={`terminal-input-${script.slug}`}
              value={value}
              onChange={(event) => setValue(event.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              placeholder="type a command or press Tab to complete"
              className="min-w-0 flex-1 bg-transparent font-mono text-[11px] text-white placeholder:text-[#6F6B85] focus:outline-none"
            />
            <button
              type="submit"
              aria-label="Run command"
              className="inline-flex shrink-0 items-center gap-1 rounded-md border border-white/15 bg-white/10 px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.08em] text-[#E9E6F4] hover:bg-white/20"
            >
              <CornerDownLeft className="h-3 w-3" /> run
            </button>
          </form>

          <div className="mt-2 flex flex-wrap gap-1.5" aria-label="Terminal shortcuts">
            {["help", "tasks", "hint", "reset"].map((shortcut) => (
              <button
                key={shortcut}
                type="button"
                onClick={() => submit(shortcut)}
                className="rounded border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[9px] text-[#A7A3B8] hover:bg-white/10 hover:text-white"
              >
                {shortcut}
              </button>
            ))}
            {script.tools.map((tool) => (
              <span key={tool} className="rounded border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[9px] text-[#6F6B85]">
                {tool}
              </span>
            ))}
          </div>
        </div>

        <aside className="border-t border-line p-4 lg:border-l lg:border-t-0">
          <div>
            <div className="flex items-center justify-between gap-2">
              <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted">Your tasks</p>
              <span className="font-mono text-[9px] font-bold text-brand-700">{progress}%</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-mist-200">
              <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-coral-400 transition-all" style={{ width: `${progress}%` }} />
            </div>
            <ul className="mt-3 space-y-1.5">
              {script.tasks.map((task) => {
                const complete = isTaskDone(task, done);
                return (
                  <li key={task.id} className={`flex items-start gap-2 rounded-lg border px-2.5 py-2 text-[10px] leading-4 ${complete ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-line bg-white text-body"}`}>
                    {complete ? (
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                    ) : (
                      <Circle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted" />
                    )}
                    {task.label}
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="mt-4 rounded-xl border border-gold-200 bg-gold-50/70 p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-gold-700">
                <Lightbulb className="h-3 w-3" /> hint
              </p>
              <button
                type="button"
                onClick={() => submit("hint")}
                disabled={allDone}
                className="rounded border border-gold-300 bg-white px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.08em] text-gold-700 disabled:opacity-40"
              >
                Reveal
              </button>
            </div>
            <p className="mt-2 text-[10px] leading-5 text-gold-900">
              {allDone
                ? "All tasks complete. Read the takeaway below, then reset and try the commands without the deck."
                : hintCommand
                  ? hintCommand.hint
                  : "Try a command first. The hint points at the next uncompleted step without giving away the whole answer."}
            </p>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted">Command deck</p>
              <span className="font-mono text-[9px] text-muted">{script.commands.length} commands</span>
            </div>
            <ol className="mt-2 max-h-[360px] space-y-2 overflow-y-auto pr-1">
              {script.commands.map((command) => {
                const executed = done.includes(command.id);
                return (
                  <li key={command.id} className={`rounded-xl border p-2.5 ${executed ? "border-emerald-200 bg-emerald-50/60" : "border-line bg-mist-50"}`}>
                    <code className="block break-words font-mono text-[10px] font-semibold leading-4 text-navy">{command.command}</code>
                    <p className="mt-1 text-[10px] leading-4 text-body">{command.summary}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => runCommand(command)}
                        className="inline-flex items-center gap-1 rounded-md border border-brand-200 bg-brand-50 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.06em] text-brand-700 hover:border-brand-300"
                      >
                        <Play className="h-2.5 w-2.5" /> run
                      </button>
                      <button
                        type="button"
                        onClick={() => insertCommand(command.command)}
                        className="rounded-md border border-line bg-white px-2 py-1 text-[9px] font-bold uppercase tracking-[0.06em] text-muted hover:border-brand-200 hover:text-brand-700"
                      >
                        insert
                      </button>
                      <button
                        type="button"
                        onClick={() => copyCommand(command.command)}
                        aria-label={`Copy command: ${command.command}`}
                        className="inline-flex items-center gap-1 rounded-md border border-line bg-white px-2 py-1 text-[9px] font-bold uppercase tracking-[0.06em] text-muted hover:border-brand-200 hover:text-brand-700"
                      >
                        {copied === command.command ? <Check className="h-2.5 w-2.5 text-emerald-600" /> : <Copy className="h-2.5 w-2.5" />}
                        {copied === command.command ? "copied" : "copy"}
                      </button>
                      {executed ? (
                        <span className="inline-flex items-center gap-1 font-mono text-[9px] text-emerald-700">
                          <CheckCircle2 className="h-2.5 w-2.5" /> done
                        </span>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>

          {allDone ? (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-[10px] leading-5 text-emerald-900">
              <strong className="font-semibold">Takeaway:</strong> {script.takeaway}
            </div>
          ) : null}
        </aside>
      </div>

      <div className="border-t border-line bg-mist-50/70 px-4 py-3 text-[10px] leading-5 text-muted sm:px-5">
        <strong className="font-semibold text-navy">Safe simulation.</strong>{" "}
        {script.safety ??
          "Commands and outputs mirror the real tools for teaching, but nothing runs and no network request is made. Run real commands only in an isolated lab you own or are authorised to use."}{" "}
        Outputs are fixtures: byte values, hashes and identifiers will differ on a real system.
      </div>
    </section>
  );
}
