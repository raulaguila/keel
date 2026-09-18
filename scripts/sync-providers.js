#!/usr/bin/env node
/**
 * Sync canonical skill/ → provider trees (.cursor/.claude/.agents).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = path.join(root, "skill");
const targets = [
  ".cursor/skills/keel",
  ".claude/skills/keel",
  ".agents/skills/keel",
];

function cpDir(s, d) {
  fs.mkdirSync(d, { recursive: true });
  for (const ent of fs.readdirSync(s, { withFileTypes: true })) {
    const a = path.join(s, ent.name);
    const b = path.join(d, ent.name);
    if (ent.isDirectory()) cpDir(a, b);
    else fs.copyFileSync(a, b);
  }
}

for (const t of targets) {
  const dest = path.join(root, t);
  fs.rmSync(dest, { recursive: true, force: true });
  cpDir(src, dest);
  try {
    fs.chmodSync(path.join(dest, "scripts", "keel"), 0o755);
  } catch { /* */ }
  console.log("synced", t);
}
