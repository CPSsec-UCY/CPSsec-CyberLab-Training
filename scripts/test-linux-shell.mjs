#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import assert from "node:assert/strict";
import ts from "typescript";

const root = process.cwd();
const linuxDir = path.join(root, "lib", "linuxTerminal");

function loadTypeScript(fileName, dependencies = {}) {
  const filePath = path.join(linuxDir, fileName);
  const source = fs.readFileSync(filePath, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
    fileName: filePath,
  }).outputText;
  const loadedModule = { exports: {} };
  const localRequire = (specifier) => {
    if (specifier in dependencies) return dependencies[specifier];
    throw new Error(`Unexpected dependency "${specifier}" in ${fileName}`);
  };
  new Function("require", "module", "exports", output)(localRequire, loadedModule, loadedModule.exports);
  return loadedModule.exports;
}

const hash = loadTypeScript("hash.ts");
const shell = loadTypeScript("engine.ts", { "./hash": hash });

assert.equal(hash.sha256("abc"), "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
assert.equal(hash.sha256(""), "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");

const lab = {
  slug: "test",
  user: "student",
  hostname: "cyberlab",
  files: {
    "note.txt": "alpha\nbeta\ndemo\n",
    "nested/a.json": '{"demo":true}\n',
  },
};

let state = shell.createShellState(lab);
let result = shell.executeShell("pwd", state);
assert.match(result.lines[0].text, /lab$/);
state = result.state;

result = shell.executeShell("ls -la", state);
assert.match(result.lines.map((line) => line.text).join("\n"), /nested\//);
state = result.state;

result = shell.executeShell("grep demo note.txt", state);
assert.equal(result.lines[0].text, "demo");
state = result.state;

result = shell.executeShell("cat note.txt | grep -n beta", state);
assert.equal(result.lines[0].text, "2:beta");
assert.ok(result.skills.includes("pipes"));
state = result.state;

result = shell.executeShell("echo hello > hello.txt && cat hello.txt", state);
assert.equal(result.lines[0].text, "hello");
assert.ok(result.skills.includes("modify"));
state = result.state;

result = shell.executeShell("mkdir -p work/out && cp note.txt work/out/copy.txt && mv work/out/copy.txt work/out/renamed.txt", state);
assert.equal(result.exitCode, 0);
state = result.state;

result = shell.executeShell("cat work/out/renamed.txt", state);
assert.equal(result.lines[0].text, "alpha");
state = result.state;

result = shell.executeShell("rm -rf work", state);
assert.equal(result.exitCode, 0);
state = result.state;

result = shell.executeShell("ls work", state);
assert.equal(result.exitCode, 1);

result = shell.executeShell("sha256sum note.txt", state);
assert.match(result.lines[0].text, /^[a-f0-9]{64}  note.txt$/);

result = shell.executeShell('find . -name "*.txt"', state);
assert.match(result.lines.map((line) => line.text).join("\n"), /note\.txt/);

result = shell.executeShell("unknown-command", state);
assert.equal(result.exitCode, 127);
assert.match(result.lines[0].text, /command not found/);

console.log("Linux shell engine tests passed.");
console.log("  SHA-256 known-answer vectors: 2");
console.log("  shell workflows: 12");
