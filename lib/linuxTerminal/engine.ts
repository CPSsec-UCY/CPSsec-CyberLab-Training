import { sha256 } from "./hash";

export type ShellTone = "ok" | "warn" | "err" | "muted";

export interface ShellLine {
  text: string;
  tone?: ShellTone;
}

export interface ShellFileNode {
  type: "file";
  content: string;
  modified: string;
}

export interface ShellDirectoryNode {
  type: "dir";
  children: Record<string, ShellNode>;
}

export type ShellNode = ShellFileNode | ShellDirectoryNode;

export interface ShellState {
  user: string;
  hostname: string;
  home: string;
  cwd: string;
  env: Record<string, string>;
  fs: ShellDirectoryNode;
}

export interface LinuxLabFixture {
  slug: string;
  user: string;
  hostname: string;
  env?: Record<string, string>;
  /** Paths are relative to /home/<user>/lab. */
  files: Record<string, string>;
  intro?: string;
}

export interface ShellExecution {
  state: ShellState;
  lines: ShellLine[];
  skills: string[];
  exitCode: number;
  clear?: boolean;
}

const MODIFIED = "Nov 25 09:00";
export const SHELL_COMMANDS = [
  "help",
  "pwd",
  "ls",
  "cd",
  "cat",
  "head",
  "tail",
  "wc",
  "grep",
  "find",
  "file",
  "sha256sum",
  "stat",
  "echo",
  "printf",
  "mkdir",
  "touch",
  "rm",
  "cp",
  "mv",
  "whoami",
  "id",
  "uname",
  "date",
  "env",
  "export",
  "which",
  "man",
  "history",
  "clear",
  "exit",
];

const HELP: Record<string, string> = {
  pwd: "pwd — print the current working directory",
  ls: "ls [-la] [path] — list files; -l adds metadata, -a includes hidden entries",
  cd: "cd [path] — change directory; no path returns to your home directory",
  cat: "cat [files...] — print file contents or piped input",
  head: "head [-n N] [file] — print the first N lines (default 10)",
  tail: "tail [-n N] [file] — print the last N lines (default 10)",
  wc: "wc [-lwc] [files...] — count lines, words and bytes",
  grep: "grep [-inv] PATTERN [files...] — search text; -i ignores case, -n numbers lines, -v inverts",
  find: "find [path] -name PATTERN [-type f|d] — list matching paths",
  file: "file [paths...] — identify the simulated file type",
  sha256sum: "sha256sum [files...] — compute a real SHA-256 digest of the virtual file bytes",
  stat: "stat [path] — show file type, size and modification time",
  echo: "echo [-n] [text...] — print text; use > or >> to write a file",
  printf: "printf FORMAT [ARGS...] — print a formatted string",
  mkdir: "mkdir [-p] paths... — create directories",
  touch: "touch paths... — create empty files",
  rm: "rm [-rf] paths... — remove files or directories",
  cp: "cp [-r] source destination — copy files or directories",
  mv: "mv source destination — rename or move files",
  whoami: "whoami — print the current simulated user",
  id: "id — print simulated user, group and supplementary groups",
  uname: "uname [-a|-r|-m|-s] — print simulated kernel information",
  date: "date — print the simulated lab date in UTC",
  env: "env — print the simulated environment",
  export: "export NAME=VALUE — set an environment variable",
  which: "which command — locate a simulated command",
  man: "man command — show short help for a builtin",
  history: "history — show commands entered in this session",
  clear: "clear — clear the terminal screen",
  exit: "exit — end the practice session",
};

function cloneState(state: ShellState): ShellState {
  return JSON.parse(JSON.stringify(state)) as ShellState;
}

function normaliseAbsolute(path: string): string {
  const parts: string[] = [];
  for (const part of path.split("/")) {
    if (!part || part === ".") continue;
    if (part === "..") parts.pop();
    else parts.push(part);
  }
  return `/${parts.join("/")}`;
}

function resolvePath(state: ShellState, path: string): string {
  if (path === "~") return state.home;
  if (path.startsWith("~/")) return normaliseAbsolute(`${state.home}/${path.slice(2)}`);
  if (path.startsWith("/")) return normaliseAbsolute(path);
  return normaliseAbsolute(`${state.cwd}/${path}`);
}

function displayPath(state: ShellState, path: string): string {
  if (path === state.home) return "~";
  if (path.startsWith(`${state.home}/`)) return `~${path.slice(state.home.length)}`;
  return path;
}

function getNode(state: ShellState, path: string): ShellNode | undefined {
  let node: ShellNode = state.fs;
  for (const part of path.split("/").filter(Boolean)) {
    if (node.type !== "dir") return undefined;
    node = node.children[part];
    if (!node) return undefined;
  }
  return node;
}

function ensureDirectory(state: ShellState, path: string): ShellDirectoryNode | null {
  let node = state.fs;
  for (const part of path.split("/").filter(Boolean)) {
    const existing = node.children[part];
    if (existing?.type === "file") return null;
    if (!existing) node.children[part] = { type: "dir", children: {} };
    node = node.children[part] as ShellDirectoryNode;
  }
  return node;
}

function writeFile(state: ShellState, path: string, content: string): string | null {
  const parentPath = path.slice(0, path.lastIndexOf("/")) || "/";
  const parent = ensureDirectory(state, parentPath);
  if (!parent) return `Not a directory: ${displayPath(state, parentPath)}`;
  const name = path.slice(path.lastIndexOf("/") + 1);
  const existing = parent.children[name];
  if (existing?.type === "dir") return `Is a directory: ${displayPath(state, path)}`;
  parent.children[name] = { type: "file", content, modified: MODIFIED };
  return null;
}

function readFile(state: ShellState, path: string): string | null {
  const node = getNode(state, path);
  if (!node) return null;
  if (node.type === "dir") return null;
  return node.content;
}

function removeNode(state: ShellState, path: string): string | null {
  const parentPath = path.slice(0, path.lastIndexOf("/")) || "/";
  const name = path.slice(path.lastIndexOf("/") + 1);
  const parent = getNode(state, parentPath);
  if (!parent || parent.type !== "dir" || !parent.children[name]) return `No such file or directory: ${displayPath(state, path)}`;
  delete parent.children[name];
  return null;
}

function cloneNode(node: ShellNode): ShellNode {
  return JSON.parse(JSON.stringify(node)) as ShellNode;
}

function copyInto(state: ShellState, sourcePath: string, destinationPath: string, recursive: boolean): string | null {
  const source = getNode(state, sourcePath);
  if (!source) return `No such file or directory: ${displayPath(state, sourcePath)}`;
  if (source.type === "dir" && !recursive) return `Omitting directory: ${displayPath(state, sourcePath)} (use -r)`;

  let finalPath = destinationPath;
  const destination = getNode(state, destinationPath);
  if (destination?.type === "dir") {
    finalPath = normaliseAbsolute(`${destinationPath}/${sourcePath.split("/").filter(Boolean).pop() ?? "item"}`);
  }

  const parentPath = finalPath.slice(0, finalPath.lastIndexOf("/")) || "/";
  const parent = getNode(state, parentPath);
  if (!parent || parent.type !== "dir") return `No such directory: ${displayPath(state, parentPath)}`;
  const name = finalPath.slice(finalPath.lastIndexOf("/") + 1);
  const existing = parent.children[name];
  if (existing?.type === "dir" && source.type === "file") return `Is a directory: ${displayPath(state, finalPath)}`;
  parent.children[name] = cloneNode(source);
  return null;
}

function moveNode(state: ShellState, sourcePath: string, destinationPath: string): string | null {
  const source = getNode(state, sourcePath);
  if (!source) return `No such file or directory: ${displayPath(state, sourcePath)}`;
  if (sourcePath === "/" || sourcePath === state.home || sourcePath === state.cwd) return "Refusing to move the lab root or current directory";
  const destination = getNode(state, destinationPath);
  const finalPath = destination?.type === "dir"
    ? normaliseAbsolute(`${destinationPath}/${sourcePath.split("/").filter(Boolean).pop()}`)
    : destinationPath;
  if (finalPath === sourcePath) return null;
  if (source.type === "dir" && finalPath.startsWith(`${sourcePath}/`)) return "Cannot move a directory into itself";
  const error = copyInto(state, sourcePath, finalPath, true);
  if (error) return error;
  return removeNode(state, sourcePath);
}

function tokenize(input: string): string[] {
  const tokens: string[] = [];
  let current = "";
  let started = false;
  let quote: "'" | '"' | null = null;
  let escaped = false;

  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];
    if (escaped) {
      current += char;
      escaped = false;
      started = true;
      continue;
    }
    if (char === "\\" && quote !== "'") {
      escaped = true;
      started = true;
      continue;
    }
    if (quote) {
      if (char === quote) quote = null;
      else current += char;
      started = true;
      continue;
    }
    if (char === "'" || char === '"') {
      quote = char;
      started = true;
      continue;
    }
    if (/\s/.test(char)) {
      if (started) {
        tokens.push(current);
        current = "";
        started = false;
      }
      continue;
    }
    if (["|", "<", ">", ";", "&"].includes(char)) {
      if (started) {
        tokens.push(current);
        current = "";
        started = false;
      }
      if (char === "&" && input[i + 1] === "&") {
        tokens.push("&&");
        i += 1;
      } else {
        tokens.push(char);
      }
      continue;
    }
    current += char;
    started = true;
  }

  if (quote) throw new Error("unterminated quote");
  if (escaped) current += "\\";
  if (started) tokens.push(current);
  return tokens;
}

function formatLongEntry(state: ShellState, name: string, node: ShellNode): string {
  const permissions = node.type === "dir" ? "drwxr-xr-x" : "-rw-r--r--";
  const size = node.type === "dir" ? 4096 : node.content.length;
  return `${permissions} 1 ${state.user} ${state.user} ${String(size).padStart(5)} ${MODIFIED} ${name}${node.type === "dir" ? "/" : ""}`;
}

function inferFileType(path: string, content: string): string {
  if (content.includes("-----BEGIN ")) return "PEM encoded data, ASCII text";
  if (/\.pcap(?:ng)?$/i.test(path)) return "tcpdump capture file (simulated metadata)";
  if (/\.json$/i.test(path)) return "JSON text data";
  if (/\.csv$/i.test(path)) return "CSV text data";
  if (/\.(?:ya?ml)$/i.test(path)) return "YAML text data";
  if (/\.(?:bin|wasm|exe|dll)$/i.test(path)) return "binary data (inert simulation fixture)";
  if (/\.(?:c|py|js|ts|sh|circom|rs)$/i.test(path)) return "source code, ASCII text";
  if (/\.pem$/i.test(path)) return "PEM certificate or key data";
  return "ASCII text";
}

function globMatch(value: string, pattern: string): boolean {
  const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*").replace(/\?/g, ".");
  return new RegExp(`^${escaped}$`).test(value);
}

function walk(state: ShellState, start: string, visit: (path: string, node: ShellNode) => void) {
  const node = getNode(state, start);
  if (!node) return;
  visit(start, node);
  if (node.type !== "dir") return;
  for (const name of Object.keys(node.children).sort((a, b) => a.localeCompare(b))) {
    walk(state, normaliseAbsolute(`${start}/${name}`), visit);
  }
}

function lineText(lines: ShellLine[]) {
  return lines.map((line) => line.text).join("\n");
}

function splitLines(content: string): string[] {
  if (!content) return [];
  const lines = content.split("\n");
  if (content.endsWith("\n")) lines.pop();
  return lines;
}

interface StageResult {
  lines: ShellLine[];
  skills: string[];
  exitCode: number;
  clear?: boolean;
}

function runSegment(state: ShellState, tokens: string[], stdin: string[]): StageResult {
  if (!tokens.length) return { lines: [], skills: [], exitCode: 0 };
  if (tokens[0] === "<") return { lines: [{ text: "Input redirection is disabled in this inert shell.", tone: "warn" }], skills: [], exitCode: 2 };

  const args: string[] = [];
  let redirect: ">" | ">>" | null = null;
  let redirectPath: string | null = null;
  for (let i = 0; i < tokens.length; i += 1) {
    if (tokens[i] === ">" || tokens[i] === ">>") {
      redirect = tokens[i] as ">" | ">>";
      redirectPath = tokens[i + 1] ?? null;
      i += 1;
    } else {
      args.push(tokens[i]);
    }
  }

  const command = args[0];
  const rest = args.slice(1);
  const result = runBuiltin(state, command, rest, stdin);

  if (redirect) {
    if (!redirectPath) return { lines: [{ text: "syntax error: expected a file after the redirection operator", tone: "err" }], skills: [], exitCode: 2 };
    if (result.exitCode !== 0) return result;
    const path = resolvePath(state, redirectPath);
    const existing = readFile(state, path) ?? "";
    const content = redirect === ">>" ? `${existing}${lineText(result.lines)}${lineText(result.lines) ? "\n" : ""}` : `${lineText(result.lines)}${lineText(result.lines) ? "\n" : ""}`;
    const error = writeFile(state, path, content);
    if (error) return { lines: [{ text: error, tone: "err" }], skills: [], exitCode: 1 };
    return { lines: [], skills: [...result.skills, "modify"], exitCode: 0 };
  }
  return result;
}

function runBuiltin(state: ShellState, command: string, args: string[], stdin: string[]): StageResult {
  const skills = new Set<string>();
  const lines: ShellLine[] = [];
  const error = (message: string): StageResult => ({ lines: [{ text: message, tone: "err" }], skills: [...skills], exitCode: 1 });

  if (command === "pwd") {
    skills.add("navigate");
    return { lines: [{ text: state.cwd }], skills: [...skills], exitCode: 0 };
  }

  if (command === "ls") {
    skills.add("navigate");
    const long = args.some((arg) => arg.startsWith("-") && arg.includes("l"));
    const all = args.some((arg) => arg.startsWith("-") && arg.includes("a"));
    const paths = args.filter((arg) => !arg.startsWith("-"));
    const targets = paths.length ? paths : ["."];
    const multiple = targets.length > 1;
    let exitCode = 0;
    for (const [targetIndex, target] of targets.entries()) {
      const path = resolvePath(state, target);
      const node = getNode(state, path);
      if (!node) {
        lines.push({ text: `ls: cannot access '${target}': No such file or directory`, tone: "err" });
        exitCode = 1;
        continue;
      }
      if (multiple || targetIndex > 0) lines.push({ text: `${target}:`, tone: "muted" });
      if (node.type === "file") {
        lines.push({ text: long ? formatLongEntry(state, path.split("/").pop() ?? target, node) : path.split("/").pop() ?? target });
        continue;
      }
      const entries = Object.entries(node.children).filter(([name]) => all || !name.startsWith(".")).sort(([a], [b]) => a.localeCompare(b));
      if (all) entries.unshift([".", node], ["..", { type: "dir", children: {} } as ShellDirectoryNode]);
      if (long) {
        for (const [name, child] of entries) lines.push({ text: formatLongEntry(state, name, child) });
      } else if (entries.length) {
        lines.push({ text: entries.map(([name, child]) => `${name}${child.type === "dir" ? "/" : ""}`).join("  ") });
      }
    }
    return { lines, skills: [...skills], exitCode };
  }

  if (command === "cd") {
    skills.add("navigate");
    const target = args[0] ?? "~";
    const path = resolvePath(state, target);
    const node = getNode(state, path);
    if (!node) return error(`cd: ${target}: No such file or directory`);
    if (node.type !== "dir") return error(`cd: ${target}: Not a directory`);
    state.cwd = path;
    return { lines: [], skills: [...skills], exitCode: 0 };
  }

  if (["cat", "head", "tail"].includes(command)) {
    skills.add("read");
    let count = 10;
    const files: string[] = [];
    for (let i = 0; i < args.length; i += 1) {
      if (args[i] === "-n" || args[i] === "-c") {
        count = Number.parseInt(args[i + 1] ?? "10", 10);
        i += 1;
      } else if (/^-[0-9]+$/.test(args[i])) {
        count = Number.parseInt(args[i].slice(1), 10);
      } else {
        files.push(args[i]);
      }
    }
    let contentLines = stdin;
    if (files.length) {
      contentLines = [];
      for (const file of files) {
        const content = readFile(state, resolvePath(state, file));
        if (content === null) return error(`${command}: ${file}: No such file or directory`);
        contentLines.push(...splitLines(content));
      }
    }
    if (!contentLines.length) return { lines: [], skills: [...skills], exitCode: 0 };
    const selected = command === "cat" ? contentLines : command === "head" ? contentLines.slice(0, count) : contentLines.slice(-count);
    return { lines: selected.map((text) => ({ text })), skills: [...skills], exitCode: 0 };
  }

  if (command === "wc") {
    skills.add("read");
    const flags = args.filter((arg) => arg.startsWith("-")).join("");
    const files = args.filter((arg) => !arg.startsWith("-"));
    const contents = files.length
      ? files.map((file) => ({ name: file, content: readFile(state, resolvePath(state, file)) }))
      : [{ name: "", content: stdin.join("\n") }];
    for (const item of contents) {
      if (item.content === null) return error(`wc: ${item.name}: No such file or directory`);
      const content = item.content ?? "";
      const lineCount = content ? content.split("\n").length - (content.endsWith("\n") ? 1 : 0) : 0;
      const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
      const byteCount = new TextEncoder().encode(content).length;
      const values = [];
      if (flags.includes("l") || !flags) values.push(lineCount);
      if (flags.includes("w") || !flags) values.push(wordCount);
      if (flags.includes("c") || !flags) values.push(byteCount);
      lines.push({ text: `${values.join(" ")}${item.name ? ` ${item.name}` : ""}` });
    }
    return { lines, skills: [...skills], exitCode: 0 };
  }

  if (command === "grep") {
    skills.add("search");
    const insensitive = args.includes("-i") || args.includes("-inv");
    const invert = args.includes("-v") || args.includes("-inv");
    const numbered = args.includes("-n") || args.includes("-inv");
    const positional = args.filter((arg) => !arg.startsWith("-"));
    const pattern = positional.shift();
    if (!pattern) return error("grep: missing search pattern");
    let regex: RegExp;
    try {
      regex = new RegExp(pattern, insensitive ? "i" : "");
    } catch {
      return error(`grep: invalid pattern: ${pattern}`);
    }
    const files = positional;
    const showNames = files.length > 1;
    const sources = files.length
      ? files.map((file) => ({ name: file, lines: splitLines(readFile(state, resolvePath(state, file)) ?? "") }))
      : [{ name: "", lines: stdin }];
    for (const source of sources) {
      if (files.length && readFile(state, resolvePath(state, source.name)) === null) return error(`grep: ${source.name}: No such file or directory`);
      for (const [index, line] of source.lines.entries()) {
        const matches = regex.test(line);
        if (matches !== invert) {
          const prefix = showNames ? `${source.name}:` : numbered ? `${index + 1}:` : "";
          lines.push({ text: `${prefix}${line}` });
        }
      }
    }
    return { lines, skills: [...skills], exitCode: lines.length ? 0 : 1 };
  }

  if (command === "find") {
    skills.add("search");
    const start = args[0] && !args[0].startsWith("-") ? args[0] : ".";
    const nameIndex = args.indexOf("-name");
    const pattern = nameIndex >= 0 ? args[nameIndex + 1] ?? "*" : "*";
    const typeIndex = args.indexOf("-type");
    const wantedType = typeIndex >= 0 ? args[typeIndex + 1] : undefined;
    const absolute = resolvePath(state, start);
    if (!getNode(state, absolute)) return error(`find: ${start}: No such file or directory`);
    walk(state, absolute, (path, node) => {
      const name = path.split("/").filter(Boolean).pop() ?? "";
      const nameMatches = nameIndex >= 0 ? globMatch(name, pattern) : true;
      if (nameMatches && (!wantedType || (wantedType === "f" ? node.type === "file" : node.type === "dir"))) {
        lines.push({ text: displayPath(state, path) });
      }
    });
    return { lines, skills: [...skills], exitCode: 0 };
  }

  if (command === "file") {
    skills.add("inspect");
    const targets = args.length ? args : ["."];
    for (const target of targets) {
      const path = resolvePath(state, target);
      const node = getNode(state, path);
      if (!node) return error(`file: ${target}: No such file or directory`);
      lines.push({ text: `${displayPath(state, path)}: ${node.type === "dir" ? "directory" : inferFileType(path, node.content)}` });
    }
    return { lines, skills: [...skills], exitCode: 0 };
  }

  if (command === "sha256sum") {
    skills.add("inspect");
    if (!args.length) return error("sha256sum: missing file");
    for (const target of args) {
      const content = readFile(state, resolvePath(state, target));
      if (content === null) return error(`sha256sum: ${target}: No such file or directory`);
      lines.push({ text: `${sha256(content)}  ${target}` });
    }
    return { lines, skills: [...skills], exitCode: 0 };
  }

  if (command === "stat") {
    skills.add("inspect");
    const target = args[0] ?? ".";
    const path = resolvePath(state, target);
    const node = getNode(state, path);
    if (!node) return error(`stat: cannot stat '${target}': No such file or directory`);
    lines.push(
      { text: `  File: ${displayPath(state, path)}` },
      { text: `  Size: ${node.type === "dir" ? 4096 : node.content.length}` },
      { text: `Access: (${node.type === "dir" ? "0755" : "0644"})  Uid: (1000/${state.user})  Gid: (1000/${state.user})` },
      { text: `Modify: ${node.type === "dir" ? MODIFIED : node.modified} UTC` },
      { text: `  Type: ${node.type === "dir" ? "directory" : "regular file"}` },
    );
    return { lines, skills: [...skills], exitCode: 0 };
  }

  if (command === "echo" || command === "printf") {
    if (command === "echo") {
      const noNewline = args[0] === "-n";
      const text = (noNewline ? args.slice(1) : args).join(" ");
      return { lines: [{ text }], skills: [], exitCode: 0 };
    }
    const format = args[0] ?? "";
    let index = 1;
    const rendered = format
      .replace(/%[sd]/g, (specifier) => (args[index++] ?? (specifier === "%d" ? "0" : "")))
      .replace(/\\n/g, "\n")
      .replace(/\\t/g, "\t")
      .replace(/\\\\/g, "\\");
    const renderedLines = rendered.split("\n");
    if (rendered.endsWith("\n")) renderedLines.pop();
    return { lines: renderedLines.filter(Boolean).map((text) => ({ text })), skills: [], exitCode: 0 };
  }

  if (command === "mkdir") {
    skills.add("modify");
    const parents = args.includes("-p");
    const targets = args.filter((arg) => !arg.startsWith("-"));
    if (!targets.length) return error("mkdir: missing operand");
    for (const target of targets) {
      const path = resolvePath(state, target);
      if (getNode(state, path)?.type === "dir") continue;
      if (!parents) {
        const parent = getNode(state, path.slice(0, path.lastIndexOf("/")) || "/");
        if (!parent || parent.type !== "dir") return error(`mkdir: cannot create directory '${target}': No such file or directory`);
      }
      const created = ensureDirectory(state, path);
      if (!created) return error(`mkdir: cannot create directory '${target}': File exists`);
    }
    return { lines, skills: [...skills], exitCode: 0 };
  }

  if (command === "touch") {
    skills.add("modify");
    if (!args.length) return error("touch: missing file operand");
    for (const target of args) {
      const path = resolvePath(state, target);
      const node = getNode(state, path);
      if (node?.type === "dir") return error(`touch: ${target}: Is a directory`);
      const writeError = writeFile(state, path, node?.type === "file" ? node.content : "");
      if (writeError) return error(`touch: ${target}: ${writeError}`);
    }
    return { lines, skills: [...skills], exitCode: 0 };
  }

  if (command === "rm") {
    skills.add("modify");
    const force = args.includes("-f");
    const recursive = args.some((arg) => arg.startsWith("-") && arg.includes("r"));
    const targets = args.filter((arg) => !arg.startsWith("-"));
    if (!targets.length) return error("rm: missing operand");
    for (const target of targets) {
      const path = resolvePath(state, target);
      if (["/", state.home, state.cwd].includes(path)) return error(`rm: refusing to remove '${target}'`);
      const node = getNode(state, path);
      if (!node) {
        if (!force) return error(`rm: cannot remove '${target}': No such file or directory`);
        continue;
      }
      if (node.type === "dir" && !recursive) return error(`rm: cannot remove '${target}': Is a directory`);
      const removeError = removeNode(state, path);
      if (removeError) return error(`rm: ${removeError}`);
    }
    return { lines, skills: [...skills], exitCode: 0 };
  }

  if (command === "cp") {
    skills.add("modify");
    const recursive = args.includes("-r");
    const positional = args.filter((arg) => !arg.startsWith("-"));
    if (positional.length < 2) return error("cp: missing source or destination file operand");
    const [source, destination] = positional;
    const copyError = copyInto(state, resolvePath(state, source), resolvePath(state, destination), recursive);
    return copyError ? error(`cp: ${copyError}`) : { lines, skills: [...skills], exitCode: 0 };
  }

  if (command === "mv") {
    skills.add("modify");
    if (args.length < 2) return error("mv: missing source or destination file operand");
    const [source, destination] = args;
    const moveError = moveNode(state, resolvePath(state, source), resolvePath(state, destination));
    return moveError ? error(`mv: ${moveError}`) : { lines, skills: [...skills], exitCode: 0 };
  }

  if (command === "whoami") {
    skills.add("inspect");
    return { lines: [{ text: state.user }], skills: [...skills], exitCode: 0 };
  }

  if (command === "id") {
    skills.add("inspect");
    return {
      lines: [{ text: `uid=1000(${state.user}) gid=1000(${state.user}) groups=1000(${state.user}),27(sudo),999(docker)` }],
      skills: [...skills],
      exitCode: 0,
    };
  }

  if (command === "uname") {
    skills.add("inspect");
    const output = args.includes("-a")
      ? "Linux cyberlab 6.11.0-24-generic #24-Ubuntu SMP PREEMPT_DYNAMIC x86_64 GNU/Linux"
      : args.includes("-r")
        ? "6.11.0-24-generic"
        : args.includes("-m")
          ? "x86_64"
          : "Linux";
    return { lines: [{ text: output }], skills: [...skills], exitCode: 0 };
  }

  if (command === "date") {
    skills.add("inspect");
    return { lines: [{ text: "Wed Nov 25 09:41:07 UTC 2026" }], skills: [...skills], exitCode: 0 };
  }

  if (command === "env") {
    skills.add("inspect");
    return { lines: Object.entries(state.env).map(([key, value]) => ({ text: `${key}=${value}` })), skills: [...skills], exitCode: 0 };
  }

  if (command === "export") {
    skills.add("modify");
    if (!args.length) return runBuiltin(state, "env", [], stdin);
    for (const assignment of args) {
      const separator = assignment.indexOf("=");
      if (separator < 1) continue;
      state.env[assignment.slice(0, separator)] = assignment.slice(separator + 1);
    }
    return { lines, skills: [...skills], exitCode: 0 };
  }

  if (command === "which") {
    skills.add("inspect");
    const target = args[0];
    if (!target) return error("which: missing command");
    if (SHELL_COMMANDS.includes(target)) return { lines: [{ text: `${target}: shell builtin` }], skills: [...skills], exitCode: 0 };
    return { lines: [{ text: `/usr/bin/${target}` }], skills: [...skills], exitCode: 0 };
  }

  if (command === "man") {
    skills.add("inspect");
    const target = args[0];
    if (!target) return error("What manual page do you want?");
    const description = HELP[target];
    if (!description) return error(`No manual entry for ${target}`);
    return {
      lines: [{ text: description }, { text: "This is a short simulation help page; run `help` to list all builtins.", tone: "muted" }],
      skills: [...skills],
      exitCode: 0,
    };
  }

  if (command === "help") {
    return {
      lines: [
        { text: "Inert Linux shell · built-in commands", tone: "ok" },
        ...Object.values(HELP).map((text) => ({ text })),
        { text: "Pipes (|), redirection (> and >>), quoted strings and command history are supported.", tone: "muted" },
        { text: "Course tools such as openssl, nmap, tshark and kubectl run from their pre-scripted guided deck.", tone: "muted" },
      ],
      skills: [],
      exitCode: 0,
    };
  }

  if (command === "clear") return { lines: [], skills: [], exitCode: 0, clear: true };
  if (command === "exit") return { lines: [{ text: "Practice session closed. Reload or reset to start a fresh lab.", tone: "muted" }], skills: [], exitCode: 0 };

  if (["sudo", "nano", "vi", "vim"].includes(command)) {
    return { lines: [{ text: `${command} is disabled in this inert simulation. Use built-in commands; echo or printf can write files.`, tone: "warn" }], skills: [], exitCode: 2 };
  }

  return {
    lines: [
      { text: `${command}: command not found`, tone: "err" },
      { text: "Type `help` for shell builtins. Course tools use the guided terminal deck above.", tone: "muted" },
    ],
    skills: [],
    exitCode: 127,
  };
}

export function createShellState(fixture: LinuxLabFixture): ShellState {
  const home = `/home/${fixture.user}`;
  const cwd = `${home}/lab`;
  const state: ShellState = {
    user: fixture.user,
    hostname: fixture.hostname,
    home,
    cwd,
    env: {
      HOME: home,
      USER: fixture.user,
      LOGNAME: fixture.user,
      SHELL: "/bin/bash",
      PATH: "/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin",
      PWD: cwd,
      TERM: "xterm-256color",
      ...fixture.env,
    },
    fs: { type: "dir", children: {} },
  };
  ensureDirectory(state, cwd);
  for (const [relativePath, content] of Object.entries(fixture.files)) {
    const path = normaliseAbsolute(`${cwd}/${relativePath}`);
    const error = writeFile(state, path, content.endsWith("\n") ? content : `${content}\n`);
    if (error) throw new Error(`Linux terminal fixture "${fixture.slug}": ${error}`);
  }
  state.env.PWD = cwd;
  return state;
}

export function executeShell(input: string, initialState: ShellState): ShellExecution {
  const state = cloneState(initialState);
  const allLines: ShellLine[] = [];
  const skills = new Set<string>();
  let exitCode = 0;
  let clear = false;
  let tokens: string[];
  try {
    tokens = tokenize(input);
  } catch (error) {
    return { state, lines: [{ text: `bash: syntax error: ${(error as Error).message}`, tone: "err" }], skills: [], exitCode: 2 };
  }

  const segments: { tokens: string[]; connector?: "|" | ";" | "&&" }[] = [];
  let current: string[] = [];
  for (const token of tokens) {
    if (["|", ";", "&&"].includes(token)) {
      segments.push({ tokens: current, connector: token as "|" | ";" | "&&" });
      current = [];
    } else {
      current.push(token);
    }
  }
  segments.push({ tokens: current });

  let stdin: string[] = [];
  for (const segment of segments) {
    if (!segment.tokens.length) continue;
    const result = runSegment(state, segment.tokens, stdin);
    result.skills.forEach((skill) => skills.add(skill));
    exitCode = result.exitCode;
    clear = result.clear ?? false;
    state.env.PWD = state.cwd;
    if (segment.connector === "|") {
      skills.add("pipes");
      stdin = result.lines.map((line) => line.text);
    } else {
      allLines.push(...result.lines);
      stdin = [];
    }
    if (segment.connector === "&&" && exitCode !== 0) break;
  }

  return { state, lines: allLines, skills: [...skills], exitCode, clear };
}

export function materializeArtifacts(initialState: ShellState, command: string, output: ShellLine[]): ShellState {
  const state = cloneState(initialState);
  const outputText = lineText(output).trim() || "[simulated artifact generated by the guided command]";
  const candidates = new Set<string>();
  const add = (value: string | undefined) => {
    if (value) candidates.add(value.replace(/^['"]|['"]$/g, ""));
  };

  for (const match of command.matchAll(/(?:^|\s)(?:-out|--output|-o|--output-file)(?:\s+|=)([^\s]+)/g)) add(match[1]);
  for (const match of command.matchAll(/(?:^|\s)-secret(?:\s+|=)([^\s]+)/g)) add(match[1]);
  for (const match of command.matchAll(/(?:^|\s)-oA(?:\s+|=)([^\s]+)/g)) add(`${match[1].replace(/^['"]|['"]$/g, "")}.nmap`);
  for (const match of command.matchAll(/(?:^|\s)>>?\s*([^\s]+)/g)) add(match[1]);

  for (const candidate of candidates) {
    if (candidate.startsWith("/dev/")) continue;
    const path = resolvePath(state, candidate);
    if (!path.startsWith(`${state.cwd}/`) && !path.startsWith(`${state.home}/`)) continue;
    writeFile(state, path, `${outputText}\n`);
  }
  return state;
}

export function listLabPaths(state: ShellState): string[] {
  const paths: string[] = [];
  walk(state, state.cwd, (path) => {
    if (path !== state.cwd) paths.push(displayPath(state, path));
  });
  return paths.sort();
}

export function listLabEntries(state: ShellState): { path: string; type: "file" | "dir" }[] {
  const entries: { path: string; type: "file" | "dir" }[] = [];
  walk(state, state.cwd, (path, node) => {
    if (path !== state.cwd) entries.push({ path: displayPath(state, path), type: node.type });
  });
  return entries.sort((a, b) => a.path.localeCompare(b.path));
}
