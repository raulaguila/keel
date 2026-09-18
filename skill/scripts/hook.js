#!/usr/bin/env node
/**
 * Keel hook — afterFileEdit (immediate) + Stop (deep pass over session files).
 * Always exit 0 (fail-open). Cursor Stop is best-effort; Claude/Codex get full deep pass.
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BACKEND_EXT = /\.(ts|tsx|js|jsx|mjs|cjs|py|go|rb|java|kt|kts|sql)$/i;
const SESSION = () => path.join(process.cwd(), ".keel", "session-touched.json");

function loadMergedHookConfig() {
  const root = process.cwd();
  /** @type {Record<string, unknown>} */
  let hook = { enabled: true, quiet: false, auditLog: null };
  for (const name of ["config.json", "config.local.json"]) {
    const p = path.join(root, ".keel", name);
    if (!fs.existsSync(p)) continue;
    try {
      const j = JSON.parse(fs.readFileSync(p, "utf8"));
      hook = { ...hook, ...(j.hook || {}) };
    } catch { /* */ }
  }
  if (process.env.KEEL_HOOK_DISABLED === "1") hook.enabled = false;
  if (process.env.KEEL_HOOK_QUIET === "1") hook.quiet = true;
  if (process.env.KEEL_HOOK_LOG) hook.auditLog = process.env.KEEL_HOOK_LOG;
  return hook;
}

function audit(hook, event, detail) {
  if (!hook.auditLog) return;
  try {
    const line = JSON.stringify({ ts: new Date().toISOString(), event, ...detail }) + "\n";
    fs.mkdirSync(path.dirname(path.resolve(String(hook.auditLog))), { recursive: true });
    fs.appendFileSync(path.resolve(String(hook.auditLog)), line);
  } catch { /* */ }
}

function readSession() {
  try {
    return JSON.parse(fs.readFileSync(SESSION(), "utf8"));
  } catch {
    return { files: [], reported: [] };
  }
}

function writeSession(s) {
  try {
    fs.mkdirSync(path.dirname(SESSION()), { recursive: true });
    fs.writeFileSync(SESSION(), JSON.stringify(s, null, 2));
  } catch { /* */ }
}

function trackFile(file) {
  const s = readSession();
  const rel = path.relative(process.cwd(), file).replace(/\\/g, "/");
  if (!s.files.includes(rel)) s.files.push(rel);
  writeSession(s);
  return rel;
}

function runDetect(args) {
  return spawnSync(process.execPath, [path.join(__dirname, "detect.js"), ...args], {
    encoding: "utf8",
    cwd: process.cwd(),
  });
}

function parseInput() {
  let input = {};
  try {
    const raw = fs.readFileSync(0, "utf8");
    if (raw.trim()) input = JSON.parse(raw);
  } catch { /* */ }
  return input;
}

function isStop(input) {
  const name = String(input.hook_event_name || input.event || input.type || "").toLowerCase();
  if (name === "stop" || name === "sessionend" || name === "stophook") return true;
  if (process.argv.includes("--stop")) return true;
  // skip shutdown-only
  if (String(input.reason || "").toLowerCase() === "shutdown") return false;
  return false;
}

function extractFile(input) {
  return (
    input.file_path ||
    input.filePath ||
    input.path ||
    input.uri ||
    (Array.isArray(input.edits) && input.edits[0]?.path) ||
    null
  );
}

function main() {
  const hook = loadMergedHookConfig();
  const input = parseInput();

  if (hook.enabled === false) {
    process.stdout.write(JSON.stringify({ continue: true }) + "\n");
    process.exit(0);
  }

  if (isStop(input)) {
    const s = readSession();
    const files = (s.files || []).filter((f) => fs.existsSync(path.resolve(process.cwd(), f)));
    if (!files.length) {
      audit(hook, "stop-empty", {});
      process.stdout.write(JSON.stringify({ continue: true }) + "\n");
      process.exit(0);
    }
    const r = runDetect(["--json", "--min-severity=p2", ...files]);
    let payload = { findings: [] };
    try {
      payload = JSON.parse(r.stdout || "{}");
    } catch { /* */ }
    const reported = new Set(s.reported || []);
    const fresh = (payload.findings || []).filter((f) => {
      const k = `${f.ruleId}|${f.file}|${f.line}`;
      if (reported.has(k)) return false;
      reported.add(k);
      return true;
    });
    s.reported = [...reported];
    s.files = [];
    writeSession(s);
    audit(hook, "stop-deep", { fileCount: files.length, fresh: fresh.length });
    if (fresh.length) {
      const top = fresh
        .slice(0, 30)
        .map((f) => `${f.severity.toUpperCase()} ${f.file}:${f.line} [${f.ruleId}] ${f.message}`);
      process.stdout.write(
        JSON.stringify({
          continue: true,
          user_message: `Keel stop deep-pass: ${fresh.length} finding(s) on session files.\n` + top.join("\n"),
        }) + "\n",
      );
    } else {
      process.stdout.write(JSON.stringify({ continue: true }) + "\n");
    }
    process.exit(0);
  }

  const file = extractFile(input);
  if (!file || !BACKEND_EXT.test(file)) {
    process.stdout.write(JSON.stringify({ continue: true }) + "\n");
    process.exit(0);
  }

  const rel = trackFile(file);
  // Immediate tier: primary only via --hook (detect already filters messaging)
  const r = runDetect(["--hook", "--min-severity=p1", file]);
  let out = r.stdout?.trim() || JSON.stringify({ continue: true });
  try {
    const j = JSON.parse(out);
    if (j.user_message) {
      const s = readSession();
      // mark lines mentioned roughly
      const m = j.user_message.matchAll(/\[([^\]]+)\]\s+/g);
      for (const x of m) {
        /* best-effort; deep pass still re-scans */
        void x;
      }
      s.reported = s.reported || [];
      writeSession(s);
      audit(hook, "edit", { file: rel, hasFindings: true });
    } else {
      audit(hook, "edit-clean", { file: rel });
      if (hook.quiet) out = JSON.stringify({ continue: true });
    }
  } catch { /* */ }

  process.stdout.write(out.endsWith("\n") ? out : out + "\n");
  process.exit(0);
}

main();
