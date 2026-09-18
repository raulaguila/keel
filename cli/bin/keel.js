#!/usr/bin/env node
/**
 * keel CLI — install / update / detect / doctor-ish helpers
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = path.resolve(__dirname, "../..");
const SKILL_SRC = path.join(PKG_ROOT, "skill");

const PROVIDERS = {
  cursor: { dir: ".cursor/skills/keel", hooks: ".cursor/hooks.json" },
  claude: { dir: ".claude/skills/keel", hooks: null },
  agents: { dir: ".agents/skills/keel", hooks: null },
  codex: { dir: ".agents/skills/keel", hooks: null },
};

function cpDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const ent of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, ent.name);
    const d = path.join(dest, ent.name);
    if (ent.isDirectory()) cpDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

function ensureKeelConfig(root) {
  const dir = path.join(root, ".keel");
  fs.mkdirSync(dir, { recursive: true });
  const cfg = path.join(dir, "config.json");
  if (!fs.existsSync(cfg)) {
    fs.writeFileSync(
      cfg,
      JSON.stringify(
        {
          hook: { enabled: true },
          detector: { ignoreRules: [], ignoreFiles: ["**/vendor/**", "**/node_modules/**"] },
        },
        null,
        2,
      ) + "\n",
    );
  }
}

function mergeCursorHooks(root, skillRel) {
  const hooksPath = path.join(root, ".cursor", "hooks.json");
  fs.mkdirSync(path.dirname(hooksPath), { recursive: true });
  let doc = { version: 1, hooks: {} };
  if (fs.existsSync(hooksPath)) {
    try {
      doc = JSON.parse(fs.readFileSync(hooksPath, "utf8"));
    } catch {
      fs.copyFileSync(hooksPath, hooksPath + ".bak");
      doc = { version: 1, hooks: {} };
    }
  }
  doc.version = doc.version ?? 1;
  doc.hooks = doc.hooks ?? {};
  const cmd = `node ${skillRel}/scripts/hook.js`;
  const entry = { command: cmd };
  const list = Array.isArray(doc.hooks.afterFileEdit) ? doc.hooks.afterFileEdit : [];
  const filtered = list.filter((h) => !(h?.command || "").includes("keel") && !(h?.command || "").includes("hook.js"));
  filtered.push(entry);
  doc.hooks.afterFileEdit = filtered;
  fs.writeFileSync(hooksPath, JSON.stringify(doc, null, 2) + "\n");
}

function install(args) {
  const root = process.cwd();
  const providers = [];
  let hooks = true;
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith("--providers=")) {
      providers.push(...args[i].slice(12).split(",").map((s) => s.trim()).filter(Boolean));
    } else if (args[i] === "--providers") {
      providers.push(...String(args[++i] || "").split(",").map((s) => s.trim()).filter(Boolean));
    } else if (args[i] === "--no-hooks") hooks = false;
  }
  if (!providers.length) providers.push("cursor");

  if (!fs.existsSync(SKILL_SRC)) {
    console.error("keel install: skill/ not found next to package");
    process.exit(1);
  }

  for (const p of providers) {
    const spec = PROVIDERS[p];
    if (!spec) {
      console.error(`unknown provider: ${p}`);
      process.exit(1);
    }
    const dest = path.join(root, spec.dir);
    cpDir(SKILL_SRC, dest);
    // make launcher executable
    try {
      fs.chmodSync(path.join(dest, "scripts", "keel"), 0o755);
    } catch { /* win */ }
    console.log(`installed skill → ${spec.dir}`);
    if (hooks && p === "cursor") {
      mergeCursorHooks(root, spec.dir);
      console.log("merged Cursor afterFileEdit hook → .cursor/hooks.json");
    }
  }
  ensureKeelConfig(root);
  console.log("wrote .keel/config.json (if missing)");
  console.log("Reload Cursor / your harness, then run /keel init");
}

function detect(args) {
  const script = path.join(SKILL_SRC, "scripts", "detect.js");
  const r = spawnSync(process.execPath, [script, ...args], { stdio: "inherit", cwd: process.cwd() });
  process.exit(r.status ?? 1);
}

function status(args) {
  const script = path.join(SKILL_SRC, "scripts", "status.js");
  const r = spawnSync(process.execPath, [script, ...args], { stdio: "inherit", cwd: process.cwd() });
  process.exit(r.status ?? 1);
}

function help() {
  console.log(`keel — backend craft skill CLI

Usage:
  keel install [--providers=cursor,claude,agents] [--no-hooks]
  keel update   (alias of install)
  keel detect [--json] [--explain] [--stack=node,python] [--min-severity=p1] [path...]
  keel status [--json] [--detect] [--slug=name] [path]
  keel help
`);
}

const [cmd, ...rest] = process.argv.slice(2);
switch (cmd) {
  case "install":
  case "update":
    install(rest);
    break;
  case "detect":
    detect(rest);
    break;
  case "status":
    status(rest);
    break;
  case "help":
  case undefined:
    help();
    break;
  default:
    console.error(`unknown command: ${cmd}`);
    help();
    process.exit(1);
}
