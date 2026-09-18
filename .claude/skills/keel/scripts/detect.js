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
  ".sql",
]);

const OPS_NAMES = new Set([
  "makefile", "dockerfile", "docker-compose.yml", "docker-compose.yaml",
  "compose.yml", "compose.yaml",
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
  "**/.cursor/**",
  "**/.claude/**",
  "**/.agents/**",
  "**/skill/scripts/**",
  "**/skill/reference/**",
];

const SEVERITIES = new Set(["p0", "p1", "p2", "p3"]);

/** Rule packs by stack. `core` always on; named packs additive via --stack. */
const STACK_PACKS = {
  core: null, // all rules without pack, or pack: "core"
  node: ["node", "js"],
  js: ["node", "js"],
  typescript: ["node", "js"],
  ts: ["node", "js"],
  python: ["python"],
  py: ["python"],
  go: ["go"],
  ruby: ["ruby"],
  rails: ["ruby"],
  java: ["java"],
  kotlin: ["java"],
  spring: ["java"],
  ops: ["ops"],
  docker: ["ops"],
  make: ["ops"],
};

const EXPLAIN = {
  "empty-catch": "Handle or rethrow; at minimum log with correlation id and fail closed on request path.",
  "select-star": "Select only needed columns; SELECT * bloats payloads and breaks when schema grows.",
  "todo-security": "Resolve or ticket the TODO(security) before merge — leave no silent security debt.",
  "hardcoded-secret": "Move secrets to env/secret manager; rotate anything that was committed.",
  "private-key-pem": "Never commit private keys; load from secret store and rotate if leaked.",
  "find-many-unbounded": "Add take/limit (and usually cursor/page) on list queries exposed to callers.",
  "n-plus-one-await-in-loop": "Batch/preload related rows (include/select_related) instead of await-per-item.",
  "http-no-timeout-js": "Pass AbortSignal.timeout(ms) or axios timeout; unbounded HTTP hangs on-call.",
  "requests-no-timeout-py": "Always pass timeout= to requests.*; prefer (connect, read) tuple.",
  "http-client-no-timeout-go": "Set http.Client{Timeout: …} or per-request context deadline.",
  "promise-all-unbounded": "Bound concurrency (p-limit / semaphore) before Promise.all on mapped I/O.",
  "console-log-prod": "Prefer structured logger with levels; strip debug console.log from hot paths.",
  "print-debug-py": "Use logging module; remove debug print() from modules that ship.",
  "md5-password": "Use a modern KDF (argon2/bcrypt/scrypt); never MD5/SHA1 for passwords.",
  "disable-ssl-verify": "Do not disable TLS verify in production; fix trust store instead.",
  "sql-string-concat": "Use parameterized queries / bound arguments; never interpolate SQL.",
  "god-file-hint": "Split by boundary/ownership; large files hide cycles and untested paths.",
  "process-env-secret-log": "Never log process.env values that may hold secrets; log keys only if needed.",
  "eval-usage": "Avoid eval/Function on untrusted input; prefer parsers.",
  "child-process-shell": "Prefer execFile/spawn without shell:true; sanitize if shell required.",
  "cors-origin-star": "Reflecting * with credentials is unsafe; whitelist origins.",
  "jwt-none-alg": "Reject alg=none / disable none algorithm explicitly.",
  "crypto-md5-hash": "Prefer SHA-256+ for integrity; never MD5 for security.",
  "express-raw-unlimited": "Set body size limits; unbounded parsers enable DoS.",
  "redis-keys-star": "KEYS * blocks Redis; use SCAN.",
  "sleep-in-handler": "Sleep/delay on request path burns workers; use async scheduling.",
  "throw-string": "Throw Error objects, not bare strings (lost stacks).",
  "process-exit-lib": "Libraries should not process.exit; leave exit to the process boundary.",
  "grpc-insecure": "Use TLS credentials in production gRPC clients/servers.",
  "amqp-no-ack-prefetch": "Set prefetch and explicit ack strategy for consumers.",
  "offset-pagination-deep": "Deep OFFSET is expensive; prefer cursor/keyset for large lists.",
  "yaml-load-unsafe": "Use safe_load / JSON; unrestricted YAML load can execute.",
  "pickle-loads": "Never unpickle untrusted data.",
  "subprocess-shell-true": "subprocess with shell=True is injection-prone.",
  "go-context-todo": "Prefer request-scoped context over context.TODO/Background on handlers.",
  "go-fmt-error-ignore": "Do not ignore fmt.Errorf/errors with _; handle or wrap.",
  "sql-drop-destructive": "Destructive DROP in migrations needs expand/contract + rollback note.",
  "dockerfile-latest-tag": "Pin image digests or major.minor; :latest drifts prod.",
  "dockerfile-user-root": "Run as non-root USER in final stage.",
  "dockerfile-secret-env": "Do not bake secrets into ENV/ARG of published images.",
  "makefile-rm-root": "Guard destructive rm targets; never rm -rf /.",
  "compose-privileged": "privileged: true is a last resort; drop caps instead.",
  "compose-bind-docker-sock": "Mounting docker.sock grants host control — avoid in app services.",
  "dangerously-disable-csrf": "CSRF disabled without documented substitute is a P0 for cookie sessions.",
  "set-interval-leak": "Uncleared setInterval on request path leaks handles.",
  "new-buffer-deprecated": "Use Buffer.from/alloc; new Buffer is unsafe/deprecated.",
  "math-random-token": "Use crypto random for tokens/secrets, not Math.random.",
  "http-listen-all-interfaces": "Binding 0.0.0.0 is fine in containers; ensure authz/network policy.",
  "django-debug-true": "DEBUG=True must not ship to production.",
  "flask-secret-hardcoded": "Set Flask/Django SECRET_KEY from env, not source.",
};

/**
 * @typedef {{
 *   id: string,
 *   severity: string,
 *   message: string,
 *   re: RegExp,
 *   ext?: string[],
 *   pack?: string,
 *   quietWindow?: number,
 *   quietNearby?: RegExp,
 * }} Rule
 */

/** @type {Rule[]} */
const RULES = [
  { id: "empty-catch", severity: "p0", pack: "core", message: "Empty or swallow catch", re: /catch\s*\([^)]*\)\s*\{\s*\}|except\s+Exception\s*:\s*(pass|\.\.\.)|rescue\s+(StandardError|Exception)\s*;?\s*end/ },
  { id: "select-star", severity: "p1", pack: "core", message: "SELECT *", re: /SELECT\s+\*\s+FROM/i },
  { id: "todo-security", severity: "p1", pack: "core", message: "TODO(security) left in code", re: /TODO\s*\(?\s*security/i },
  { id: "hardcoded-secret", severity: "p0", pack: "core", message: "Possible hardcoded secret/token", re: /(?:api[_-]?key|secret|password|token)\s*[:=]\s*['"][^'"]{8,}['"]/i },
  { id: "private-key-pem", severity: "p0", pack: "core", message: "PEM private key material", re: /-----BEGIN (?:RSA |EC )?PRIVATE KEY-----/ },
  { id: "find-many-unbounded", severity: "p1", pack: "node", message: "Possibly unbounded findMany/findAll", re: /\.findMany\s*\(\s*\)|\.findAll\s*\(\s*\)|\.all\s*\(\s*\)/ },
  { id: "n-plus-one-await-in-loop", severity: "p1", pack: "core", message: "await inside for/while loop (possible N+1)", re: /for\s*\([^)]+\)\s*\{[^}]{0,200}await\s+/s },
  {
    id: "http-no-timeout-js",
    severity: "p1",
    pack: "node",
    message: "fetch/axios without visible timeout/AbortSignal nearby",
    re: /\bfetch\s*\(|(?:axios\.(?:get|post|put|delete|patch|request)|got\(|needle\()\s*\(/,
    ext: [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"],
    quietWindow: 400,
    quietNearby: /AbortSignal|signal\s*:|timeout\s*:|AbortController/,
  },
  {
    id: "requests-no-timeout-py",
    severity: "p1",
    pack: "python",
    message: "requests.* without timeout=",
    re: /requests\.(get|post|put|delete|patch|request)\s*\(/,
    ext: [".py"],
    quietWindow: 200,
    quietNearby: /timeout\s*=/,
  },
  { id: "http-client-no-timeout-go", severity: "p1", pack: "go", message: "http.Client without Timeout", re: /&http\.Client\{\s*\}/, ext: [".go"] },
  { id: "promise-all-unbounded", severity: "p2", pack: "node", message: "Promise.all over mapped async (fan-out risk)", re: /Promise\.all\s*\(\s*\w+\.(?:map|flatMap)\s*\(/ },
  { id: "console-log-prod", severity: "p3", pack: "node", message: "console.log in backend path", re: /\bconsole\.log\s*\(/, ext: [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"] },
  { id: "print-debug-py", severity: "p3", pack: "python", message: "print() debug in Python module", re: /^\s*print\s*\(/m, ext: [".py"] },
  { id: "md5-password", severity: "p0", pack: "core", message: "MD5/SHA1 used in password-like context", re: /(?:password|passwd).{0,40}(?:md5|sha1)|(?:md5|sha1).{0,40}(?:password|passwd)/i },
  { id: "disable-ssl-verify", severity: "p0", pack: "core", message: "TLS verification disabled", re: /rejectUnauthorized\s*:\s*false|verify\s*=\s*False|InsecureSkipVerify\s*:\s*true/ },
  { id: "sql-string-concat", severity: "p0", pack: "core", message: "SQL built via string concat/interpolation", re: /(?:query|execute|raw)\s*\(\s*[`'"].*\+|f["'].*(?:SELECT|INSERT|UPDATE|DELETE)|`[^`]*\$\{[^}]+\}[^`]*(?:SELECT|INSERT|UPDATE|DELETE)/i },
  { id: "god-file-hint", severity: "p2", pack: "core", message: "Very large source file (>800 lines) — god module risk", re: /(?:)/ },
  { id: "process-env-secret-log", severity: "p1", pack: "node", message: "Logging process.env likely secret", re: /console\.(?:log|info|debug|error)\s*\([^)]*process\.env\./ },
  { id: "eval-usage", severity: "p0", pack: "core", message: "eval / new Function", re: /\beval\s*\(|new\s+Function\s*\(/ },
  { id: "child-process-shell", severity: "p1", pack: "node", message: "child_process with shell:true", re: /(?:exec|spawn|execSync|spawnSync)\s*\([^)]*shell\s*:\s*true/ },
  { id: "cors-origin-star", severity: "p1", pack: "node", message: "CORS origin *", re: /origin\s*:\s*['"]\*['"]|Access-Control-Allow-Origin['":\s]+\*/ },
  { id: "jwt-none-alg", severity: "p0", pack: "core", message: "JWT none algorithm risk", re: /algorithms?\s*:\s*\[[^\]]*['"]none['"]|alg['"\s:=]+none/i },
  { id: "crypto-md5-hash", severity: "p1", pack: "core", message: "MD5/SHA1 createHash for security-ish use", re: /createHash\s*\(\s*['"]md5['"]\)|hashlib\.md5|MessageDigest\.getInstance\(\s*"MD5"/ },
  { id: "express-raw-unlimited", severity: "p1", pack: "node", message: "express.json/raw without limit", re: /express\.(?:json|raw|urlencoded)\s*\(\s*\)/ },
  { id: "redis-keys-star", severity: "p1", pack: "core", message: "Redis KEYS *", re: /\.keys\s*\(\s*['"]\*['"]\s*\)|KEYS\s+\*/i },
  { id: "sleep-in-handler", severity: "p2", pack: "core", message: "Sleep/delay on likely request path", re: /await\s+.*\.(?:sleep|wait)\s*\(|time\.sleep\s*\(|Thread\.sleep\s*\(/ },
  { id: "throw-string", severity: "p2", pack: "node", message: "throw of bare string", re: /throw\s+['"`]/ },
  { id: "process-exit-lib", severity: "p2", pack: "node", message: "process.exit in module body path", re: /process\.exit\s*\(/ },
  { id: "grpc-insecure", severity: "p1", pack: "core", message: "gRPC insecure credentials", re: /createInsecure\s*\(|insecure\.NewCredentials\s*\(|usePlaintext\s*\(\s*true/ },
  { id: "amqp-no-ack-prefetch", severity: "p2", pack: "core", message: "AMQP consume without visible prefetch/noAck:false", re: /\.consume\s*\([^)]*noAck\s*:\s*true/ },
  { id: "offset-pagination-deep", severity: "p2", pack: "core", message: "OFFSET-only pagination smell", re: /OFFSET\s+\$|OFFSET\s+\d+|skip\s*:\s*\w+/i },
  { id: "yaml-load-unsafe", severity: "p0", pack: "python", message: "yaml.load without SafeLoader", re: /yaml\.load\s*\([^)]*\)(?!.*SafeLoader)/, ext: [".py"] },
  { id: "pickle-loads", severity: "p0", pack: "python", message: "pickle.loads", re: /pickle\.loads?\s*\(/, ext: [".py"] },
  { id: "subprocess-shell-true", severity: "p1", pack: "python", message: "subprocess shell=True", re: /subprocess\.(?:call|run|Popen)\s*\([^)]*shell\s*=\s*True/, ext: [".py"] },
  { id: "go-context-todo", severity: "p2", pack: "go", message: "context.TODO/Background in handler-ish code", re: /context\.(?:TODO|Background)\s*\(\s*\)/, ext: [".go"] },
  { id: "sql-drop-destructive", severity: "p1", pack: "ops", message: "Destructive DROP in SQL migration", re: /DROP\s+(TABLE|COLUMN|DATABASE|SCHEMA)\b/i, ext: [".sql"] },
  { id: "dockerfile-latest-tag", severity: "p1", pack: "ops", message: "Docker image :latest", re: /^FROM\s+\S+:latest\b/im, fileMatch: /(^|\/)Dockerfile/i },
  { id: "dockerfile-user-root", severity: "p2", pack: "ops", message: "USER root in Dockerfile", re: /^USER\s+root\b/im, fileMatch: /(^|\/)Dockerfile/i },
  { id: "dockerfile-secret-env", severity: "p0", pack: "ops", message: "Secret-like ENV/ARG in Dockerfile", re: /^(?:ENV|ARG)\s+(?:.*_)?(?:SECRET|PASSWORD|TOKEN|API_KEY)\b/im, fileMatch: /(^|\/)Dockerfile/i },
  { id: "makefile-rm-root", severity: "p0", pack: "ops", message: "Dangerous rm -rf /", re: /rm\s+-rf\s+\/(?!\w)/, fileMatch: /(^|\/)Makefile$/i },
  { id: "compose-privileged", severity: "p1", pack: "ops", message: "compose privileged: true", re: /privileged\s*:\s*true/, fileMatch: /compose\.(yml|yaml)$/i },
  { id: "compose-bind-docker-sock", severity: "p0", pack: "ops", message: "docker.sock bind mount", re: /\/var\/run\/docker\.sock/, fileMatch: /compose\.(yml|yaml)$/i },
  { id: "dangerously-disable-csrf", severity: "p0", pack: "node", message: "CSRF protection disabled", re: /csrf\s*\(\s*false|disableCsrf|CSRF_COOKIE_SECURE\s*=\s*False/i },
  { id: "set-interval-leak", severity: "p2", pack: "node", message: "setInterval without clearInterval nearby", re: /\bsetInterval\s*\(/, quietWindow: 500, quietNearby: /clearInterval/ },
  { id: "new-buffer-deprecated", severity: "p1", pack: "node", message: "new Buffer(", re: /new\s+Buffer\s*\(/ },
  { id: "math-random-token", severity: "p1", pack: "core", message: "Math.random for token/secret", re: /(?:token|secret|password|nonce).{0,40}Math\.random|Math\.random.{0,40}(?:token|secret|password|nonce)/i },
  { id: "django-debug-true", severity: "p0", pack: "python", message: "DEBUG = True", re: /\bDEBUG\s*=\s*True\b/, ext: [".py"] },
  { id: "flask-secret-hardcoded", severity: "p0", pack: "python", message: "Hardcoded SECRET_KEY", re: /SECRET_KEY\s*=\s*['"][^'"]+['"]/, ext: [".py"] },
];

function loadConfig(root) {
  const merge = (base, extra) => {
    if (!extra) return base;
    return {
      ignoreRules: [...new Set([...(base.ignoreRules || []), ...(extra.ignoreRules || [])])],
      ignoreFiles: [...new Set([...(base.ignoreFiles || []), ...(extra.ignoreFiles || [])])],
      severityOverrides: { ...(base.severityOverrides || {}), ...(extra.severityOverrides || {}) },
      stacks: extra.stacks?.length ? extra.stacks : base.stacks,
      minSeverity: extra.minSeverity ?? base.minSeverity,
      hook: { ...(base.hook || {}), ...(extra.hook || {}) },
    };
  };

  let cfg = {
    ignoreRules: [],
    ignoreFiles: [...DEFAULT_IGNORE_GLOBS],
    severityOverrides: {},
    stacks: [],
    minSeverity: null,
    hook: { enabled: true, quiet: false, auditLog: null, consent: null },
  };

  for (const name of ["config.json", "config.local.json"]) {
    const p = path.join(root, ".keel", name);
    if (!fs.existsSync(p)) continue;
    try {
      const j = JSON.parse(fs.readFileSync(p, "utf8"));
      cfg = merge(cfg, {
        ignoreRules: j?.detector?.ignoreRules,
        ignoreFiles: j?.detector?.ignoreFiles,
        severityOverrides: j?.detector?.severityOverrides ?? j?.detector?.severity,
        stacks: j?.detector?.stacks,
        minSeverity: j?.detector?.minSeverity,
        hook: j?.hook,
      });
    } catch { /* keep */ }
  }

  // Env overrides
  if (process.env.KEEL_HOOK_DISABLED === "1") cfg.hook.enabled = false;
  if (process.env.KEEL_HOOK_QUIET === "1") cfg.hook.quiet = true;
  if (process.env.KEEL_HOOK_LOG) cfg.hook.auditLog = process.env.KEEL_HOOK_LOG;

  return cfg;
}

function resolveSeverity(ruleId, base, overrides) {
  const o = overrides?.[ruleId];
  if (o && SEVERITIES.has(String(o).toLowerCase())) return String(o).toLowerCase();
  return base;
}

function severityRank(s) {
  return { p0: 0, p1: 1, p2: 2, p3: 3 }[s] ?? 9;
}

function activePacks(cliStacks, cfgStacks) {
  const raw = [...(cliStacks || []), ...(cfgStacks || [])].map((s) => String(s).toLowerCase());
  if (!raw.length) return null; // all packs
  const set = new Set(["core"]);
  for (const s of raw) {
    const mapped = STACK_PACKS[s];
    if (mapped === null) set.add("core");
    else if (Array.isArray(mapped)) mapped.forEach((p) => set.add(p));
    else set.add(s);
  }
  return set;
}

function isOpsFile(name) {
  const lower = name.toLowerCase();
  if (OPS_NAMES.has(lower)) return true;
  if (/^dockerfile\./i.test(name)) return true;
  if (/^docker-compose\./i.test(name)) return true;
  if (/^compose\./i.test(name)) return true;
  return false;
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
    else if (CODE_EXT.has(path.extname(e.name)) || isOpsFile(e.name)) out.push(full);
  }
  return out;
}

function matchGlob(file, glob) {
  const esc = glob
    .replace(/[.+^${}()|[\]\\]/g, "\\$&")
    .replace(/\*\*/g, ":::DDOT:::")
    .replace(/\*/g, "[^/]*")
    .replace(/:::DDOT:::/g, ".*");
  return new RegExp("^" + esc + "$").test(file.replace(/\\/g, "/"));
}

function nearbyHas(text, index, window, re) {
  const start = Math.max(0, index - Math.floor(window / 4));
  const end = Math.min(text.length, index + window);
  return re.test(text.slice(start, end));
}

function scanFile(file, cfg, root, { respectIgnore = true, packs = null } = {}) {
  const rel = path.relative(root, file).replace(/\\/g, "/");
  if (
    respectIgnore &&
    cfg.ignoreFiles.some((g) => matchGlob(rel, g) || matchGlob(file.replace(/\\/g, "/"), g))
  ) {
    return [];
  }
  const ext = path.extname(file);
  let text;
  try {
    text = fs.readFileSync(file, "utf8");
  } catch {
    return [];
  }
  const findings = [];
  const lines = text.split(/\r?\n/);

  if (
    lines.length > 800 &&
    !cfg.ignoreRules.includes("god-file-hint") &&
    (!packs || packs.has("core"))
  ) {
    const sev = resolveSeverity("god-file-hint", "p2", cfg.severityOverrides);
    findings.push({
      ruleId: "god-file-hint",
      severity: sev,
      message: `Very large source file (${lines.length} lines) — god module risk`,
      file: rel,
      line: 1,
      snippet: lines[0]?.slice(0, 120) ?? "",
      explain: EXPLAIN["god-file-hint"],
    });
  }

  for (const rule of RULES) {
    if (rule.id === "god-file-hint") continue;
    if (cfg.ignoreRules.includes(rule.id)) continue;
    const pack = rule.pack || "core";
    if (packs && !packs.has(pack) && pack !== "core") continue;
    if (packs && pack === "core" && !packs.has("core")) continue;
    if (rule.ext && !rule.ext.includes(ext)) continue;
    if (rule.fileMatch && !rule.fileMatch.test(rel) && !rule.fileMatch.test(path.basename(file))) continue;

    // Multiline / ops whole-file rules (flags include m or s or quietNearby)
    const wholeFile = rule.quietNearby || rule.id === "n-plus-one-await-in-loop" || (rule.re.flags || "").includes("m");
    if (wholeFile) {
      let m;
      const re = new RegExp(rule.re.source, rule.re.flags.includes("g") ? rule.re.flags : rule.re.flags + "g");
      while ((m = re.exec(text)) !== null) {
        if (rule.quietNearby && nearbyHas(text, m.index, rule.quietWindow || 300, rule.quietNearby)) {
          continue;
        }
        const line = text.slice(0, m.index).split(/\n/).length;
        const sev = resolveSeverity(rule.id, rule.severity, cfg.severityOverrides);
        findings.push({
          ruleId: rule.id,
          severity: sev,
          message: rule.message,
          file: rel,
          line,
          snippet: m[0].slice(0, 120).replace(/\n/g, " "),
          explain: EXPLAIN[rule.id],
        });
      }
      continue;
    }

    lines.forEach((line, i) => {
      if (rule.re.test(line)) {
        const sev = resolveSeverity(rule.id, rule.severity, cfg.severityOverrides);
        findings.push({
          ruleId: rule.id,
          severity: sev,
          message: rule.message,
          file: rel,
          line: i + 1,
          snippet: line.trim().slice(0, 160),
          explain: EXPLAIN[rule.id],
        });
      }
      rule.re.lastIndex = 0;
    });
  }
  return findings;
}

function parseArgs(argv) {
  const args = {
    json: false,
    hook: false,
    explain: false,
    help: false,
    listRules: false,
    stacks: [],
    minSeverity: null,
    paths: [],
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--json") args.json = true;
    else if (a === "--hook") args.hook = true;
    else if (a === "--explain") args.explain = true;
    else if (a === "--list-rules") args.listRules = true;
    else if (a === "--help" || a === "-h") args.help = true;
    else if (a === "--stack" || a === "--stacks") {
      const v = argv[++i] || "";
      args.stacks.push(...v.split(",").map((s) => s.trim()).filter(Boolean));
    } else if (a.startsWith("--stack=")) {
      args.stacks.push(...a.slice(8).split(",").map((s) => s.trim()).filter(Boolean));
    } else if (a.startsWith("--stacks=")) {
      args.stacks.push(...a.slice(9).split(",").map((s) => s.trim()).filter(Boolean));
    } else if (a === "--min-severity") {
      args.minSeverity = String(argv[++i] || "").toLowerCase();
    } else if (a.startsWith("--min-severity=")) {
      args.minSeverity = a.slice(15).toLowerCase();
    } else if (!a.startsWith("-")) args.paths.push(a);
  }
  return args;
}

function listRules() {
  console.log("id\tseverity\tpack\tmessage");
  for (const r of RULES) {
    console.log(`${r.id}\t${r.severity}\t${r.pack || "core"}\t${r.message}`);
  }
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(`keel detect — scan backend anti-patterns

Usage:
  node detect.js [--json] [--hook] [--explain] [--stack=node,python,go]
                 [--min-severity=p1] [--list-rules] [path...]

Options:
  --explain          Include remediation hint per finding
  --stack=…          Limit to stack packs (core always included).
                     Packs: node|ts, python, go, ruby, java (comma-separated).
                     Default: all packs.
  --min-severity=pN  Drop findings weaker than pN (p0..p3)
  --list-rules       Print rule id / severity / pack

Config (.keel/config.json → detector):
  ignoreRules[], ignoreFiles[], severityOverrides { ruleId: "p0"|"p1"|"p2"|"p3" },
  stacks[], minSeverity

Exit: 0 clean, 2 findings, 1 error
`);
    process.exit(0);
  }

  if (args.listRules) {
    listRules();
    process.exit(0);
  }

  const root = process.cwd();
  const cfg = loadConfig(root);
  const packs = activePacks(args.stacks, cfg.stacks);
  const minSev = args.minSeverity || cfg.minSeverity;
  if (minSev && !SEVERITIES.has(minSev)) {
    console.error(`keel detect: invalid --min-severity ${minSev}`);
    process.exit(1);
  }

  const targets = args.paths.length ? args.paths : ["."];
  /** @type {{ file: string, respectIgnore: boolean }[]} */
  const entries = [];
  for (const t of targets) {
    const abs = path.resolve(root, t);
    if (!fs.existsSync(abs)) {
      console.error(`keel detect: path not found: ${t}`);
      process.exit(1);
    }
    const st = fs.statSync(abs);
    const respectIgnore = path.resolve(root, t) === path.resolve(root, ".");
    if (st.isDirectory()) {
      const collected = [];
      walk(abs, collected);
      for (const f of collected) entries.push({ file: f, respectIgnore });
    } else {
      entries.push({ file: abs, respectIgnore: false });
    }
  }

  let findings = entries.flatMap(({ file, respectIgnore }) =>
    scanFile(file, cfg, root, { respectIgnore, packs }),
  );
  const fileCount = entries.length;

  const seen = new Set();
  findings = findings.filter((f) => {
    const k = `${f.ruleId}|${f.file}|${f.line}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  if (minSev) {
    const floor = severityRank(minSev);
    findings = findings.filter((f) => severityRank(f.severity) <= floor);
  }

  const primary = findings.filter((f) => f.severity === "p0" || f.severity === "p1");

  if (args.json || args.hook) {
    const payload = {
      ok: true,
      root,
      fileCount,
      findingCount: findings.length,
      primaryCount: primary.length,
      stacks: packs ? [...packs] : ["*"],
      findings: args.explain
        ? findings
        : findings.map(({ explain, ...rest }) => rest),
    };
    if (args.hook) {
      if (primary.length) {
        const top = primary
          .slice(0, 20)
          .map((f) => `${f.severity.toUpperCase()} ${f.file}:${f.line} [${f.ruleId}] ${f.message}`);
        console.log(
          JSON.stringify({
            continue: true,
            user_message: `Keel detector: ${primary.length} primary finding(s).\n` + top.join("\n"),
          }),
        );
      } else {
        console.log(JSON.stringify({ continue: true }));
      }
    } else {
      console.log(JSON.stringify(payload, null, 2));
    }
  } else {
    for (const f of findings) {
      console.error(`${f.severity.toUpperCase()} ${f.file}:${f.line} [${f.ruleId}] ${f.message}`);
      if (f.snippet) console.error(`  ${f.snippet}`);
      if (args.explain && f.explain) console.error(`  → ${f.explain}`);
    }
    console.error(
      `keel detect: ${findings.length} finding(s) in ${fileCount} file(s) (${primary.length} primary)`,
    );
  }

  process.exit(primary.length ? 2 : 0);
}

main();
