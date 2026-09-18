#!/usr/bin/env node
/**
 * keel CLI — install / update / detect / status / doctor / live / pin
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import {
  PROVIDER_CATALOG,
  expandProviders,
  listProviderIds,
} from "../lib/providers.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = path.resolve(__dirname, "../..");
const SKILL_SRC = path.join(PKG_ROOT, "skill");
const SKILL_NAME = "keel";

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
  doc.hooks.PostToolUse = [
    ...(doc.hooks.PostToolUse || []).filter((h) => !(h.command || "").includes("keel")),
    entry,
  ];
  doc.hooks.Stop = [
    ...(doc.hooks.Stop || []).filter((h) => !(h.command || "").includes("keel")),
    stop,
  ];
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

function mergeCodexHooks(root, skillRel) {
  const p = path.join(root, ".codex", "hooks.json");
  fs.mkdirSync(path.dirname(p), { recursive: true });
  let doc = { hooks: [] };
  if (fs.existsSync(p)) {
    try {
      doc = JSON.parse(fs.readFileSync(p, "utf8"));
    } catch {
      doc = { hooks: [] };
    }
  }
  const hooks = Array.isArray(doc.hooks) ? doc.hooks : [];
  const filtered = hooks.filter((h) => !(String(h.command || "").includes("keel")));
  filtered.push({ event: "postToolUse", command: `node ${skillRel}/scripts/hook.js` });
  filtered.push({ event: "stop", command: `node ${skillRel}/scripts/hook.js --stop` });
  doc.hooks = filtered;
  fs.writeFileSync(p, JSON.stringify(doc, null, 2) + "\n");
}

function mergeGrokHooks(root, skillRel) {
  const p = path.join(root, ".grok", "hooks", "keel.json");
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

function installInto(root, providerId, hooks) {
  const spec = PROVIDER_CATALOG[providerId];
  const dirs = [spec.dir(SKILL_NAME), ...((spec.extraDirs && spec.extraDirs(SKILL_NAME)) || [])];
  for (const rel of dirs) {
    const dest = path.join(root, rel);
    cpDir(SKILL_SRC, dest);
    try {
      fs.chmodSync(path.join(dest, "scripts", "keel"), 0o755);
    } catch { /* */ }
    console.log(`installed → ${rel} (${spec.label})`);
  }
  const primary = spec.dir(SKILL_NAME);
  if (hooks && spec.hooks === "cursor") {
    mergeCursorHooks(root, primary);
    console.log("  hooks: Cursor afterFileEdit + stop");
  }
  if (hooks && spec.hooks === "claude") {
    mergeClaudeHooks(root, primary);
    console.log("  hooks: Claude PostToolUse + Stop");
  }
  if (hooks && spec.hooks === "copilot") {
    mergeCopilotHooks(root, primary);
    console.log("  hooks: .github/hooks/keel.json");
  }
  if (hooks && spec.hooks === "codex") {
    mergeCodexHooks(root, primary);
    console.log("  hooks: .codex/hooks.json");
  }
  if (hooks && spec.hooks === "grok") {
    mergeGrokHooks(root, primary);
    console.log("  hooks: .grok/hooks/keel.json");
  }
}

function install(args) {
  const root = process.cwd();
  let raw = [];
  let hooks = true;
  let listOnly = false;
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith("--providers=")) {
      raw.push(...args[i].slice(12).split(",").map((s) => s.trim()).filter(Boolean));
    } else if (args[i] === "--providers") {
      raw.push(...String(args[++i] || "").split(",").map((s) => s.trim()).filter(Boolean));
    } else if (args[i] === "--no-hooks") hooks = false;
    else if (args[i] === "--list-providers") listOnly = true;
    else if (args[i] === "all") raw.push("all");
  }

  if (listOnly) {
    console.log("id\tlabel\tpath\tinvoke");
    for (const id of listProviderIds()) {
      const s = PROVIDER_CATALOG[id];
      console.log(`${id}\t${s.label}\t${s.dir(SKILL_NAME)}\t${s.invoke(SKILL_NAME)}`);
    }
    return;
  }

  if (!raw.length) raw = ["cursor"];
  let providers;
  try {
    providers = expandProviders(raw);
  } catch (e) {
    console.error(String(e.message || e));
    console.error("Use: keel install --list-providers");
    process.exit(1);
  }

  if (!fs.existsSync(SKILL_SRC)) {
    console.error("keel install: skill/ not found next to package");
    process.exit(1);
  }

  for (const p of providers) installInto(root, p, hooks);
  ensureKeelConfig(root);
  console.log("wrote .keel/config.json + config.local.json (if missing)");
  console.log("Reload your harness, then run /keel init");
}

function runScript(name, args) {
  const script = path.join(SKILL_SRC, "scripts", name);
  const r = spawnSync(process.execPath, [script, ...args], { stdio: "inherit", cwd: process.cwd() });
  process.exit(r.status ?? 1);
}

function help() {
  console.log(`keel — backend craft skill CLI

Usage:
  keel install [--providers=cursor,claude,…|all] [--no-hooks]
  keel install --list-providers
  keel update   (alias of install)
  keel detect | status | doctor | live | pin …
  keel help

Providers: ${listProviderIds().join(", ")}, all
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
