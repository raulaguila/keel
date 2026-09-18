#!/usr/bin/env node
/**
 * pin — create lightweight Cursor/Claude skill shims so /audit → /keel audit.
 * Usage: node pin.js add audit|…   | remove <cmd> | list
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PKG = path.resolve(__dirname, "../..");
const META = JSON.parse(fs.readFileSync(path.join(__dirname, "command-metadata.json"), "utf8"));

const PINNABLE = Object.keys(META).filter((k) => META[k].pinnable !== false);

function shimBody(cmd) {
  const desc = META[cmd]?.description || `Delegate to /keel ${cmd}`;
  return `---
name: ${cmd}
description: "${desc.replace(/"/g, '\\"')} Delegates to keel ${cmd}."
---

This is a **pin shim**. Load and follow the Keel skill command \`${cmd}\`:

1. Open the installed Keel skill (\`.cursor/skills/keel/SKILL.md\` or \`.claude/skills/keel/SKILL.md\`).
2. Run exactly as \`/keel ${cmd}\` with the user's arguments.
3. Do not invent a separate playbook — Keel's reference/${cmd}.md (or SKILL routing) is authoritative.
`;
}

function providers() {
  return [
    path.join(process.cwd(), ".cursor", "skills"),
    path.join(process.cwd(), ".claude", "skills"),
    path.join(process.cwd(), ".agents", "skills"),
  ].filter((d) => fs.existsSync(path.dirname(d)) || true);
}

function add(cmd) {
  if (!PINNABLE.includes(cmd)) {
    console.error(`not pinnable: ${cmd}. Allowed: ${PINNABLE.join(", ")}`);
    process.exit(1);
  }
  for (const root of providers()) {
    const dir = path.join(root, cmd);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "SKILL.md"), shimBody(cmd));
    console.log(`pinned ${cmd} → ${path.relative(process.cwd(), dir)}`);
  }
}

function remove(cmd) {
  for (const root of providers()) {
    const dir = path.join(root, cmd);
    const skill = path.join(dir, "SKILL.md");
    if (fs.existsSync(skill) && fs.readFileSync(skill, "utf8").includes("pin shim")) {
      fs.rmSync(dir, { recursive: true, force: true });
      console.log(`removed pin ${dir}`);
    }
  }
}

function list() {
  console.log("pinnable:", PINNABLE.join(", "));
}

const [action, cmd] = process.argv.slice(2);
switch (action) {
  case "add":
    if (!cmd) {
      console.error("usage: pin add <command>");
      process.exit(1);
    }
    add(cmd);
    break;
  case "remove":
  case "rm":
    remove(cmd);
    break;
  case "list":
  case undefined:
    list();
    break;
  default:
    console.error("usage: pin add|remove|list");
    process.exit(1);
}
