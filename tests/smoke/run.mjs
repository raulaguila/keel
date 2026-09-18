#!/usr/bin/env node
/**
 * Smoke: clean fixture → 0 primary; smelly → required rules; status CLI runs;
 * --explain / --stack / severityOverrides behave.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const detect = path.join(root, "skill/scripts/detect.js");
const status = path.join(root, "skill/scripts/status.js");

function runDetect(args, cwd = root) {
  return spawnSync(process.execPath, [detect, ...args], { encoding: "utf8", cwd });
}

function fail(msg) {
  console.error("SMOKE FAIL:", msg);
  process.exit(1);
}

// 1) clean fixture — no primary
{
  const r = runDetect(["--json", "tests/fixtures/clean-api"]);
  let p;
  try {
    p = JSON.parse(r.stdout || "{}");
  } catch {
    fail("clean JSON parse");
  }
  if ((p.primaryCount ?? 99) !== 0) {
    fail(`clean expected 0 primary, got ${p.primaryCount}: ${JSON.stringify(p.findings)}`);
  }
  if (r.status !== 0) fail(`clean exit expected 0, got ${r.status}`);
}

// 2) smelly still flags required
{
  const r = runDetect(["--json", "--explain", "tests/fixtures/smelly-api"]);
  const p = JSON.parse(r.stdout || "{}");
  const ids = new Set((p.findings || []).map((f) => f.ruleId));
  for (const id of ["empty-catch", "select-star", "hardcoded-secret", "find-many-unbounded", "http-no-timeout-js"]) {
    if (!ids.has(id)) fail(`smelly missing ${id}`);
  }
  if (!p.findings?.some((f) => f.explain)) fail("--explain missing explain fields");
  if (r.status !== 2) fail(`smelly exit expected 2, got ${r.status}`);
}

// 3) quiet timeout: AbortSignal nearby should not flag
{
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "keel-quiet-"));
  fs.writeFileSync(
    path.join(tmp, "ok.js"),
    `export async function call() {\n  return fetch("https://x.test", { signal: AbortSignal.timeout(1000) });\n}\n`,
  );
  const r = runDetect(["--json", tmp]);
  const p = JSON.parse(r.stdout || "{}");
  const http = (p.findings || []).filter((f) => f.ruleId === "http-no-timeout-js");
  if (http.length) fail(`quiet timeout still flagged: ${JSON.stringify(http)}`);
}

// 4) --stack=python should skip node-only rules on a JS file with findMany
{
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "keel-stack-"));
  fs.writeFileSync(path.join(tmp, "x.js"), `await db.user.findMany();\n`);
  const all = JSON.parse(runDetect(["--json", tmp]).stdout || "{}");
  const py = JSON.parse(runDetect(["--json", "--stack=python", tmp]).stdout || "{}");
  if (!(all.findings || []).some((f) => f.ruleId === "find-many-unbounded")) {
    fail("baseline find-many missing");
  }
  if ((py.findings || []).some((f) => f.ruleId === "find-many-unbounded")) {
    fail("--stack=python should skip node pack find-many");
  }
}

// 5) severityOverrides
{
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "keel-sev-"));
  fs.mkdirSync(path.join(tmp, ".keel"));
  fs.writeFileSync(
    path.join(tmp, ".keel", "config.json"),
    JSON.stringify({ detector: { severityOverrides: { "console-log-prod": "p0" } } }),
  );
  fs.writeFileSync(path.join(tmp, "x.js"), `console.log("hi");\n`);
  const p = JSON.parse(runDetect(["--json", path.join(tmp, "x.js")], tmp).stdout || "{}");
  const hit = (p.findings || []).find((f) => f.ruleId === "console-log-prod");
  if (!hit || hit.severity !== "p0") fail(`severity override failed: ${JSON.stringify(hit)}`);
}

// 6) status script with fake critique snapshot
{
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "keel-status-"));
  fs.mkdirSync(path.join(tmp, ".keel", "critique"), { recursive: true });
  fs.writeFileSync(
    path.join(tmp, ".keel", "critique", "2026-01-01T00-00-00__demo.md"),
    `---
target: demo
slug: demo
total_score: 20
max_score: 32
p0_count: 1
p1_count: 0
---

## Priority issues

- **[P0] Missing timeout**
`,
  );
  const r = spawnSync(process.execPath, [status, "--json", "--slug=demo"], {
    encoding: "utf8",
    cwd: tmp,
  });
  const p = JSON.parse(r.stdout || "{}");
  if (p.ship !== "open") fail(`status ship expected open, got ${p.ship}`);
  if (!p.openIssues?.length) fail("status expected open issues");
  if (r.status !== 2) fail(`status exit expected 2, got ${r.status}`);
}

// 7) doctor --json runs
{
  const doctor = path.join(root, "skill/scripts/doctor.js");
  const r = spawnSync(process.execPath, [doctor, "--json"], { encoding: "utf8", cwd: root });
  let p;
  try {
    p = JSON.parse(r.stdout || "{}");
  } catch {
    fail("doctor JSON parse: " + r.stdout + r.stderr);
  }
  if (!Array.isArray(p.findings)) fail("doctor findings missing");
}

// 8) ops pack flags Dockerfile :latest
{
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "keel-ops-"));
  fs.writeFileSync(path.join(tmp, "Dockerfile"), "FROM node:20-alpine:latest\nUSER root\n");
  // note: node:20-alpine:latest is weird - use proper latest tag
  fs.writeFileSync(path.join(tmp, "Dockerfile"), "FROM node:latest\nUSER root\n");
  const p = JSON.parse(runDetect(["--json", "--stack=ops", tmp]).stdout || "{}");
  const ids = new Set((p.findings || []).map((f) => f.ruleId));
  if (!ids.has("dockerfile-latest-tag")) fail("ops missing dockerfile-latest-tag: " + [...ids]);
}

// 9) rule inventory size
{
  const r = runDetect(["--list-rules"]);
  const lines = (r.stdout || "").trim().split("\n").filter(Boolean);
  // header + rules
  if (lines.length < 40) fail(`expected >=40 rule lines, got ${lines.length}`);
}

// 10) live-api connection refused → exit 1
{
  const live = path.join(root, "skill/scripts/live-api.js");
  const r = spawnSync(
    process.execPath,
    [live, "--base=http://127.0.0.1:59999", "--path=/health", "--timeout=500"],
    { encoding: "utf8", cwd: root },
  );
  if (r.status !== 1) fail(`live-api expected exit 1 on refused, got ${r.status}`);
}

console.log("smoke ok");
