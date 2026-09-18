#!/usr/bin/env node
/**
 * Keel detector MVP — deterministic backend anti-pattern scan.
 * Exit: 0 clean, 2 findings, 1 scan error.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const CODE_EXT = new Set([
  ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs",
  ".py", ".go", ".rb", ".java", ".kt", ".kts", ".rs",
]);

const IGNORE_DIR = new Set([
  "node_modules", ".git", "dist", "build", "coverage", ".next",
  "vendor", "target", "__pycache__", ".venv", "venv", ".keel",
  // harness / skill install roots — not application source
  ".cursor", ".claude", ".agents", ".codex", ".gemini", ".github",
]);

const DEFAULT_IGNORE_GLOBS = [
  "**/node_modules/**",
  "**/vendor/**",
  "**/dist/**",
  "**/build/**",
  "**/.keel/**",
  "**/.cursor/skills/**",
  "**/.claude/skills/**",
  "**/.agents/skills/**",
  "**/tests/fixtures/**",
  "**/skill/scripts/**",
  "**/skill/reference/**",
];

/** @type {{ id: string, severity: string, message: string, re: RegExp, ext?: string[] }[]} */
const RULES = [
  { id: "empty-catch", severity: "p0", message: "Empty or swallow catch", re: /catch\s*\([^)]*\)\s*\{\s*\}|except\s+Exception\s*:\s*(pass|\.\.\.)|rescue\s+(StandardError|Exception)\s*;?\s*end/ },
  { id: "select-star", severity: "p1", message: "SELECT *", re: /SELECT\s+\*\s+FROM/i },
  { id: "todo-security", severity: "p1", message: "TODO(security) left in code", re: /TODO\s*\(?\s*security/i },
  { id: "hardcoded-secret", severity: "p0", message: "Possible hardcoded secret/token", re: /(?:api[_-]?key|secret|password|token)\s*[:=]\s*['"][^'"]{8,}['"]/i },
  { id: "private-key-pem", severity: "p0", message: "PEM private key material", re: /-----BEGIN (?:RSA |EC )?PRIVATE KEY-----/ },
  { id: "find-many-unbounded", severity: "p1", message: "Possibly unbounded findMany/findAll", re: /\.findMany\s*\(\s*\)|\.findAll\s*\(\s*\)|\.all\s*\(\s*\)/ },
  { id: "n-plus-one-await-in-loop", severity: "p1", message: "await inside for/while loop (possible N+1)", re: /for\s*\([^)]+\)\s*\{[^}]{0,200}await\s+/s },
  { id: "http-no-timeout-js", severity: "p1", message: "fetch/axios without visible timeout/AbortSignal nearby", re: /\bfetch\s*\(\s*['"`]https?:|(?:axios\.(?:get|post|put|delete)|got\(|needle\(|request\()\s*\(/, ext: [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"] },
  { id: "requests-no-timeout-py", severity: "p1", message: "requests.* without timeout=", re: /requests\.(get|post|put|delete|request)\s*\([^)]*\)(?![^;]*timeout\s*=)/, ext: [".py"] },
  { id: "http-client-no-timeout-go", severity: "p1", message: "http.Client without Timeout", re: /&http\.Client\{\s*\}/, ext: [".go"] },
  { id: "promise-all-unbounded", severity: "p2", message: "Promise.all over mapped async (fan-out risk)", re: /Promise\.all\s*\(\s*\w+\.(?:map|flatMap)\s*\(/ },
  { id: "console-log-prod", severity: "p3", message: "console.log in backend path", re: /\bconsole\.log\s*\(/, ext: [".ts", ".tsx", ".js", ".jsx"] },
  { id: "print-debug-py", severity: "p3", message: "print() debug in Python module", re: /^\s*print\s*\(/m, ext: [".py"] },
  { id: "md5-password", severity: "p0", message: "MD5/SHA1 used in password-like context", re: /(?:password|passwd).{0,40}(?:md5|sha1)|(?:md5|sha1).{0,40}(?:password|passwd)/i },
  { id: "disable-ssl-verify", severity: "p0", message: "TLS verification disabled", re: /rejectUnauthorized\s*:\s*false|verify\s*=\s*False|InsecureSkipVerify\s*:\s*true/ },
  { id: "sql-string-concat", severity: "p0", message: "SQL built via string concat/interpolation", re: /(?:query|execute|raw)\s*\(\s*[`'"].*\+|f["'].*(?:SELECT|INSERT|UPDATE|DELETE)|`[^`]*\$\{[^}]+\}[^`]*(?:SELECT|INSERT|UPDATE|DELETE)/i },
  { id: "god-file-hint", severity: "p2", message: "Very large source file (>800 lines) — god module risk", re: /(?:)/ }, // handled specially
  { id: "process-env-secret-log", severity: "p1", message: "Logging process.env likely secret", re: /console\.(?:log|info|debug|error)\s*\([^)]*process\.env\./ },
];

function loadConfig(root) {
  const p = path.join(root, ".keel", "config.json");
  let ignoreRules = [];
  let ignoreFiles = [...DEFAULT_IGNORE_GLOBS];
  if (fs.existsSync(p)) {
    try {
      const j = JSON.parse(fs.readFileSync(p, "utf8"));
      ignoreRules = j?.detector?.ignoreRules ?? [];
      const extra = j?.detector?.ignoreFiles ?? [];
      ignoreFiles = [...new Set([...ignoreFiles, ...extra])];
    } catch {
      /* keep defaults */
    }
  }
  return { ignoreRules, ignoreFiles };
}

function walk(dir, out = []) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    if (IGNORE_DIR.has(e.name)) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, out);
    else if (CODE_EXT.has(path.extname(e.name))) out.push(full);
  }
  return out;
}

function matchGlob(file, glob) {
  // tiny glob: ** and *
  const esc = glob
    .replace(/[.+^${}()|[\]\\]/g, "\\$&")
    .replace(/\*\*/g, ":::DDOT:::")
    .replace(/\*/g, "[^/]*")
    .replace(/:::DDOT:::/g, ".*");
  return new RegExp("^" + esc + "$").test(file.replace(/\\/g, "/"));
}

function scanFile(file, cfg, root) {
  const rel = path.relative(root, file).replace(/\\/g, "/");
  if (cfg.ignoreFiles.some((g) => matchGlob(rel, g) || matchGlob(file, g))) return [];
  const ext = path.extname(file);
  let text;
  try {
    text = fs.readFileSync(file, "utf8");
  } catch {
    return [];
  }
  const findings = [];
  const lines = text.split(/\r?\n/);

  if (lines.length > 800 && !cfg.ignoreRules.includes("god-file-hint")) {
    findings.push({
      ruleId: "god-file-hint",
      severity: "p2",
      message: `Very large source file (${lines.length} lines) — god module risk`,
      file: rel,
      line: 1,
      snippet: lines[0]?.slice(0, 120) ?? "",
    });
  }

  for (const rule of RULES) {
    if (rule.id === "god-file-hint") continue;
    if (cfg.ignoreRules.includes(rule.id)) continue;
    if (rule.ext && !rule.ext.includes(ext)) continue;
    // line-oriented for most; multiline for n-plus-one
    if (rule.id === "n-plus-one-await-in-loop") {
      let m;
      const re = new RegExp(rule.re.source, rule.re.flags.includes("g") ? rule.re.flags : rule.re.flags + "g");
      while ((m = re.exec(text)) !== null) {
        const line = text.slice(0, m.index).split(/\n/).length;
        findings.push({
          ruleId: rule.id,
          severity: rule.severity,
          message: rule.message,
          file: rel,
          line,
          snippet: m[0].slice(0, 120).replace(/\n/g, " "),
        });
      }
      continue;
    }
    lines.forEach((line, i) => {
      if (rule.re.test(line)) {
        findings.push({
          ruleId: rule.id,
          severity: rule.severity,
          message: rule.message,
          file: rel,
          line: i + 1,
          snippet: line.trim().slice(0, 160),
        });
      }
      rule.re.lastIndex = 0;
    });
  }
  return findings;
}

function parseArgs(argv) {
  const args = { json: false, hook: false, paths: [], help: false };
  for (const a of argv) {
    if (a === "--json") args.json = true;
    else if (a === "--hook") args.hook = true;
    else if (a === "--help" || a === "-h") args.help = true;
    else if (!a.startsWith("-")) args.paths.push(a);
  }
  return args;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(`keel detect — scan backend anti-patterns

Usage:
  node detect.js [--json] [--hook] [path...]

Exit: 0 clean, 2 findings, 1 error
`);
    process.exit(0);
  }

  const root = process.cwd();
  const cfg = loadConfig(root);
  const targets = args.paths.length ? args.paths : ["."];
  const files = [];
  for (const t of targets) {
    const abs = path.resolve(root, t);
    if (!fs.existsSync(abs)) {
      console.error(`keel detect: path not found: ${t}`);
      process.exit(1);
    }
    const st = fs.statSync(abs);
    if (st.isDirectory()) walk(abs, files);
    else files.push(abs);
  }

  const findings = files.flatMap((f) => scanFile(f, cfg, root));
  // de-dupe identical rule+file+line
  const seen = new Set();
  const unique = findings.filter((f) => {
    const k = `${f.ruleId}|${f.file}|${f.line}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  const primary = unique.filter((f) => f.severity === "p0" || f.severity === "p1");

  if (args.json || args.hook) {
    const payload = {
      ok: true,
      root,
      fileCount: files.length,
      findingCount: unique.length,
      primaryCount: primary.length,
      findings: unique,
    };
    if (args.hook) {
      // Cursor afterFileEdit-friendly summary on stdout
      if (primary.length) {
        const top = primary.slice(0, 20).map((f) => `${f.severity.toUpperCase()} ${f.file}:${f.line} [${f.ruleId}] ${f.message}`);
        console.log(JSON.stringify({
          continue: true,
          user_message: `Keel detector: ${primary.length} primary finding(s).\n` + top.join("\n"),
        }));
      } else {
        console.log(JSON.stringify({ continue: true }));
      }
    } else {
      console.log(JSON.stringify(payload, null, 2));
    }
  } else {
    for (const f of unique) {
      console.error(`${f.severity.toUpperCase()} ${f.file}:${f.line} [${f.ruleId}] ${f.message}`);
      if (f.snippet) console.error(`  ${f.snippet}`);
    }
    console.error(`keel detect: ${unique.length} finding(s) in ${files.length} file(s) (${primary.length} primary)`);
  }

  process.exit(primary.length ? 2 : 0);
}

main();
