#!/usr/bin/env node
/**
 * Cursor afterFileEdit hook entry.
 * Reads JSON from stdin (Cursor hooks protocol), scans edited file if backend-ish.
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const BACKEND_EXT = /\.(ts|tsx|js|jsx|mjs|cjs|py|go|rb|java|kt|kts)$/i;

async function readStdin() {
  const chunks = [];
  for await (const c of process.stdin) chunks.push(c);
  return Buffer.concat(chunks).toString("utf8");
}

function main() {
  let input = {};
  try {
    const raw = fs.readFileSync(0, "utf8"); // may be empty when tested manually
    if (raw.trim()) input = JSON.parse(raw);
  } catch {
    // non-JSON stdin
  }

  const file =
    input.file_path ||
    input.filePath ||
    input.path ||
    input.uri ||
    (Array.isArray(input.edits) && input.edits[0]?.path) ||
    null;

  if (!file || !BACKEND_EXT.test(file)) {
    process.stdout.write(JSON.stringify({ continue: true }) + "\n");
    process.exit(0);
  }

  // Respect project config hook.enabled === false
  const cfgPath = path.join(process.cwd(), ".keel", "config.json");
  if (fs.existsSync(cfgPath)) {
    try {
      const cfg = JSON.parse(fs.readFileSync(cfgPath, "utf8"));
      if (cfg?.hook?.enabled === false) {
        process.stdout.write(JSON.stringify({ continue: true }) + "\n");
        process.exit(0);
      }
    } catch { /* ignore */ }
  }

  const r = spawnSync(process.execPath, [path.join(__dirname, "detect.js"), "--hook", file], {
    encoding: "utf8",
    cwd: process.cwd(),
  });
  if (r.stdout) process.stdout.write(r.stdout);
  else process.stdout.write(JSON.stringify({ continue: true }) + "\n");
  // Always continue editing; findings are advisory in MVP
  process.exit(0);
}

main();
