#!/usr/bin/env node
/**
 * Keel doctor — artifact drift checks.
 * Exit: 0 ok, 2 findings, 1 error.
 * Flags: --json --fix
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = process.cwd();

function parseArgs(argv) {
  const a = { json: false, fix: false, help: false };
  for (const x of argv) {
    if (x === "--json") a.json = true;
    else if (x === "--fix") a.fix = true;
    else if (x === "--help" || x === "-h") a.help = true;
  }
  return a;
}

function exists(p) {
  return fs.existsSync(path.join(ROOT, p));
}

function read(p) {
  try {
    return fs.readFileSync(path.join(ROOT, p), "utf8");
  } catch {
    return null;
  }
}

function hasAppCode() {
  for (const d of ["src", "app", "apps", "services", "internal", "cmd", "pkg", "lib"]) {
    if (exists(d)) return true;
  }
  return false;
}

function hasMigrations() {
  const candidates = [
    "migrations",
    "prisma/migrations",
    "db/migrate",
    "supabase/migrations",
    "flyway",
  ];
  return candidates.some((c) => exists(c));
}

function extractPaths(arch) {
  if (!arch) return [];
  const paths = new Set();
  const re = /`([^`]+)`|^\s*[-*]\s+([A-Za-z0-9_./-]+)/gm;
  let m;
  while ((m = re.exec(arch)) !== null) {
    const t = (m[1] || m[2] || "").trim();
    if (!t || t.length < 2) continue;
    if (/https?:/.test(t)) continue;
    if (t.includes(" ")) continue;
    if (/^[A-Z][a-z]+$/.test(t)) continue;
    if (/\//.test(t) || /\.(ts|js|go|py)$/.test(t)) paths.add(t.replace(/^\.\//, ""));
  }
  return [...paths];
}

function listRuleIds() {
  const out = spawnSync(process.execPath, [path.join(__dirname, "detect.js"), "--list-rules"], {
    encoding: "utf8",
    cwd: ROOT,
  });
  return (out.stdout || "")
    .split("\n")
    .slice(1)
    .map((l) => l.split("\t")[0])
    .filter(Boolean);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(`keel doctor — artifact drift

Usage: node doctor.js [--json] [--fix]
`);
    process.exit(0);
  }

  /** @type {{ id: string, severity: string, status: string, summary: string, fix?: string, auto?: boolean }[]} */
  const findings = [];

  const product = read("PRODUCT.md");
  const arch = read("ARCHITECTURE.md");

  if (!product) {
    findings.push({
      id: "missing-product",
      severity: "high",
      status: "fail",
      summary: "PRODUCT.md missing",
      fix: "/keel init",
    });
  } else if (!/keel:product-schema/.test(product)) {
    findings.push({
      id: "product-schema-stamp",
      severity: "med",
      status: "warn",
      summary: "PRODUCT.md missing keel:product-schema stamp",
      fix: "add <!-- keel:product-schema 1 -->",
      auto: true,
    });
  }

  if (hasAppCode() && !arch) {
    findings.push({
      id: "missing-architecture",
      severity: "high",
      status: "fail",
      summary: "ARCHITECTURE.md missing while app code exists",
      fix: "/keel document",
    });
  } else if (arch && !/keel:architecture-schema/.test(arch)) {
    findings.push({
      id: "architecture-schema-stamp",
      severity: "med",
      status: "warn",
      summary: "ARCHITECTURE.md missing keel:architecture-schema stamp",
      fix: "add <!-- keel:architecture-schema 1 -->",
      auto: true,
    });
  }

  if (arch) {
    for (const p of extractPaths(arch).slice(0, 40)) {
      if (!exists(p) && !exists(p.replace(/\/$/, ""))) {
        // only flag if looks like a directory/module path
        if (p.split("/").length >= 2) {
          findings.push({
            id: "stale-architecture-path",
            severity: "med",
            status: "warn",
            summary: `ARCHITECTURE path missing on disk: ${p}`,
            fix: "update Boundaries or restore path",
          });
        }
      }
    }
  }

  if (hasMigrations() && arch) {
    if (!/##\s*Delivery/i.test(arch) || /##\s*Delivery\s*\n\s*(<!--|$)/i.test(arch)) {
      findings.push({
        id: "delivery-empty-with-migrations",
        severity: "med",
        status: "warn",
        summary: "migrations/ present but ARCHITECTURE Delivery empty/missing",
        fix: "/keel document (Delivery) or surgical edit — doc-sync.md",
      });
    }
  }

  if ((exists("Makefile") || exists("Dockerfile")) && arch && !/Makefile|Docker|compose|migrate/i.test(arch)) {
    findings.push({
      id: "ops-not-in-delivery",
      severity: "low",
      status: "warn",
      summary: "Makefile/Dockerfile exist but Delivery never mentions build/run/migrate",
      fix: "sync Delivery — ops-surfaces.md",
    });
  }

  const cfgPath = path.join(ROOT, ".keel", "config.json");
  if (!fs.existsSync(cfgPath)) {
    findings.push({
      id: "missing-config",
      severity: "low",
      status: "warn",
      summary: ".keel/config.json missing",
      fix: "write defaults",
      auto: true,
    });
  } else {
    try {
      const j = JSON.parse(fs.readFileSync(cfgPath, "utf8"));
      const known = new Set(listRuleIds());
      for (const id of j?.detector?.ignoreRules || []) {
        if (known.size && !known.has(id)) {
          findings.push({
            id: "unknown-ignore-rule",
            severity: "low",
            status: "warn",
            summary: `detector.ignoreRules unknown id: ${id}`,
          });
        }
      }
    } catch {
      findings.push({
        id: "invalid-config",
        severity: "low",
        status: "fail",
        summary: ".keel/config.json invalid JSON",
        fix: "repair JSON",
      });
    }
  }

  // hooks presence (Cursor)
  if (exists(".cursor/hooks.json")) {
    try {
      const h = JSON.parse(read(".cursor/hooks.json"));
      const list = h?.hooks?.afterFileEdit || [];
      const ok = list.some((e) => String(e.command || "").includes("hook.js") || String(e.command || "").includes("keel"));
      if (!ok) {
        findings.push({
          id: "hook-missing",
          severity: "high",
          status: "warn",
          summary: ".cursor/hooks.json has no Keel hook entry",
          fix: "keel install --providers=cursor",
        });
      }
    } catch { /* */ }
  }

  if (args.fix) {
    for (const f of findings.filter((x) => x.auto)) {
      if (f.id === "product-schema-stamp" && product) {
        const next = product.includes("keel:product-schema")
          ? product
          : product.replace(/^# Product\s*\n/, "# Product\n\n<!-- keel:product-schema 1 -->\n");
        fs.writeFileSync(path.join(ROOT, "PRODUCT.md"), next.startsWith("#") ? (product.match(/keel:product-schema/) ? product : `<!-- keel:product-schema 1 -->\n${product}`) : product);
        f.status = "fixed";
      }
      if (f.id === "architecture-schema-stamp" && arch) {
        if (!/keel:architecture-schema/.test(arch)) {
          fs.writeFileSync(path.join(ROOT, "ARCHITECTURE.md"), `<!-- keel:architecture-schema 1 -->\n${arch}`);
        }
        f.status = "fixed";
      }
      if (f.id === "missing-config") {
        fs.mkdirSync(path.join(ROOT, ".keel"), { recursive: true });
        fs.writeFileSync(
          cfgPath,
          JSON.stringify(
            {
              hook: { enabled: true, quiet: false },
              detector: { ignoreRules: [], ignoreFiles: [], severityOverrides: {} },
            },
            null,
            2,
          ) + "\n",
        );
        f.status = "fixed";
      }
    }
  }

  const open = findings.filter((f) => f.status === "fail" || f.status === "warn");

  if (args.json) {
    console.log(JSON.stringify({ ok: open.length === 0, findings }, null, 2));
  } else {
    console.log("check\tstatus\tsummary\taction");
    for (const f of findings) {
      console.log(`${f.id}\t${f.status}\t${f.summary}\t${f.fix || ""}`);
    }
    console.log(`keel doctor: ${open.length} open finding(s)`);
  }

  process.exit(open.length ? 2 : 0);
}

main();
