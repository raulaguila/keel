#!/usr/bin/env node
/**
 * Oracle: detector must flag known smells in fixtures/smelly-api
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const detect = path.join(root, "skill/scripts/detect.js");
const fixture = path.join(root, "tests/fixtures/smelly-api");

const r = spawnSync(process.execPath, [detect, "--json", fixture], {
  encoding: "utf8",
  cwd: root,
});

let payload;
try {
  payload = JSON.parse(r.stdout || "{}");
} catch (e) {
  console.error("failed to parse detector JSON", r.stdout, r.stderr);
  process.exit(1);
}

const ids = new Set((payload.findings || []).map((f) => f.ruleId));
const required = [
  "empty-catch",
  "select-star",
  "hardcoded-secret",
  "find-many-unbounded",
  "http-no-timeout-js",
];

const missing = required.filter((id) => !ids.has(id));
if (missing.length) {
  console.error("MISSING rules:", missing.join(", "));
  console.error("got:", [...ids].join(", "));
  process.exit(1);
}

if (r.status !== 2) {
  console.error("expected exit 2 with findings, got", r.status);
  process.exit(1);
}

console.log("oracle ok:", required.length, "required rules present;", payload.findingCount, "findings");
