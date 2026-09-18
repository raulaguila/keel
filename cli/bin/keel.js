#!/usr/bin/env node
/**
 * keel CLI — install / update / detect / status / doctor / live / pin
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = path.resolve(__dirname, "../..");
const SKILL_SRC = path.join(PKG_ROOT, "skill");

const PROVIDERS = {
  cursor: { dir: ".cursor/skills/keel", hooks: "cursor" },
  claude: { dir: ".claude/skills/keel", hooks: "claude" },
  agents: { dir: ".agents/skills/keel", hooks: null },
  codex: { dir: ".agents/skills/keel", hooks: "codex" },
  gemini: { dir: ".gemini/skills/keel", hooks: null },
  copilot: { dir: ".github/skills/keel", hooks: "copilot" },
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
          hook: { enabled: true, quiet: false },
          detector: {
            ignoreRules: [],
            ignoreFiles: ["**/vendor/**", "**/node_modules/**"],
            severityOverrides: {},
          },
        },
        null,
        2,
      ) + "\n",
    );
  }
  const local = path.join(dir, "config.local.json");
  if (!fs.existsSync(local)) {
    fs.writeFileSync(
      local,
      JSON.stringify({ hook: { consent: "accepted", quiet: false } }, null, 2) + "\n",
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
  const stopCmd = `node ${skillRel}/scripts/hook.js --stop`;
  const filterKeel = (list) =>
    (Array.isArray(list) ? list : []).filter(
      (h) => !(h?.command || "").includes("keel") && !(h?.command || "").includes("hook.js"),
    );
  doc.hooks.afterFileEdit = [...filterKeel(doc.hooks.afterFileEdit), { command: cmd }];
  // Best-effort Stop (Cursor may not always dispatch)
  doc.hooks.stop = [...filterKeel(doc.hooks.stop), { command: stopCmd }];
  fs.writeFileSync(hooksPath, JSON.stringify(doc, null, 2) + "\n");
}

function mergeClaudeHooks(root, skillRel) {
  const settings = path.join(root, ".claude", "settings.local.json");
  fs.mkdirSync(path.dirname(settings), { recursive: true });
  let doc = {};
  if (fs.existsSync(settings)) {
    try {
      doc = JSON.parse(fs.readFileSync(settings, "utf8"));
    } catch {
      doc = {};
    }
  }
  doc.hooks = doc.hooks || {};
  const entry = { type: "command", command: `node ${skillRel}/scripts/hook.js` };
  const stop = { type: "command", command: `node ${skillRel}/scripts/hook.js --stop` };
  doc.hooks.PostToolUse = [...(doc.hooks.PostToolUse || []).filter((h) => !(h.command || "").includes("keel")), entry];
  doc.hooks.Stop = [...(doc.hooks.Stop || []).filter((h) => !(h.command || "").includes("keel")), stop];
  fs.writeFileSync(settings, JSON.stringify(doc, null, 2) + "\n");
}

function mergeCopilotHooks(root, skillRel) {
  const p = path.join(root, ".github", "hooks", "keel.json");
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(
    p,
    JSON.stringify(
      {
        hooks: [
          { event: "postToolUse", command: `node ${skillRel}/scripts/hook.js` },
          { event: "stop", command: `node ${skillRel}/scripts/hook.js --stop` },
        ],
      },
      null,
      2,
    ) + "\n",
  );
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
      console.error(`unknown provider: ${p} (cursor|claude|agents|codex|gemini|copilot)`);
      process.exit(1);
    }
    const dest = path.join(root, spec.dir);
    cpDir(SKILL_SRC, dest);
    try {
      fs.chmodSync(path.join(dest, "scripts", "keel"), 0o755);
    } catch { /* */ }
    console.log(`installed skill → ${spec.dir}`);
    if (hooks && spec.hooks === "cursor") {
      mergeCursorHooks(root, spec.dir);
      console.log("merged Cursor afterFileEdit + stop hooks");
    }
    if (hooks && spec.hooks === "claude") {
      mergeClaudeHooks(root, spec.dir);
      console.log("merged Claude PostToolUse + Stop hooks → settings.local.json");
    }
    if (hooks && spec.hooks === "copilot") {
      mergeCopilotHooks(root, spec.dir);
      console.log("wrote .github/hooks/keel.json");
    }
  }
  ensureKeelConfig(root);
  console.log("wrote .keel/config.json + config.local.json (if missing)");
  console.log("Reload harness, then run /keel init");
}

function runScript(name, args) {
  const script = path.join(SKILL_SRC, "scripts", name);
  const r = spawnSync(process.execPath, [script, ...args], { stdio: "inherit", cwd: process.cwd() });
  process.exit(r.status ?? 1);
}

function help() {
  console.log(`keel — backend craft skill CLI

Usage:
  keel install [--providers=cursor,claude,agents,codex,gemini,copilot] [--no-hooks]
  keel update
  keel detect  [--json] [--explain] [--stack=…] [--min-severity=p1] [path...]
  keel status  [--json] [--detect] [--slug=name] [path]
  keel doctor  [--json] [--fix]
  keel live    --base=URL [--path=/health] [--json]
  keel pin     add|remove|list [command]
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
    runScript("detect.js", rest);
    break;
  case "status":
    runScript("status.js", rest);
    break;
  case "doctor":
    runScript("doctor.js", rest);
    break;
  case "live":
  case "live-api":
    runScript("live-api.js", rest);
    break;
  case "pin":
    runScript("pin.js", rest);
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
