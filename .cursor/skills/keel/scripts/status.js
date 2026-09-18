#!/usr/bin/env node
/**
 * Keel status — pulse from .keel/critique snapshots (+ optional detect).
 * Exit: 0 ok, 1 error, 2 open primary issues.
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function parseArgs(argv) {
  const args = { json: false, detect: false, help: false, slug: null, paths: [] };
  for (const a of argv) {
    if (a === "--json") args.json = true;
    else if (a === "--detect") args.detect = true;
    else if (a === "--help" || a === "-h") args.help = true;
    else if (a.startsWith("--slug=")) args.slug = a.slice(7);
    else if (!a.startsWith("-")) args.paths.push(a);
  }
  return args;
}

function parseFrontmatter(text) {
  if (!text.startsWith("---")) return { meta: {}, body: text };
  const end = text.indexOf("\n---", 3);
  if (end < 0) return { meta: {}, body: text };
  const raw = text.slice(3, end).trim();
  const body = text.slice(end + 4);
  /** @type {Record<string, string>} */
  const meta = {};
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^([a-zA-Z0-9_]+):\s*(.*)$/);
    if (!m) continue;
    meta[m[1]] = m[2].replace(/^\[|\]$/g, "").replace(/^["']|["']$/g, "").trim();
  }
  return { meta, body };
}

function listCritiques(root, slug) {
  const dir = path.join(root, ".keel", "critique");
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md") && (!slug || f.includes(`__${slug}.md`) || f.includes(`__${slug}__`)))
    .map((f) => {
      const full = path.join(dir, f);
      const text = fs.readFileSync(full, "utf8");
      const { meta, body } = parseFrontmatter(text);
      const m = f.match(/^(.+?)__(.+)\.md$/);
      return {
        file: f,
        path: full,
        ts: m?.[1] || f,
        slug: meta.slug || m?.[2] || slug,
        meta,
        body,
        mtime: fs.statSync(full).mtimeMs,
      };
    })
    .sort((a, b) => a.mtime - b.mtime);
}

function openIssuesFromBody(body) {
  const issues = [];
  const re = /^\s*[-*]?\s*\*\*\[(P[0-3])\]\s+(.+?)\*\*/gm;
  let m;
  while ((m = re.exec(body)) !== null) {
    issues.push({ severity: m[1].toLowerCase(), title: m[2].trim() });
  }
  // softer pattern: [P0] Title
  const re2 = /^\s*[-*]?\s*\[(P[0-3])\]\s+(.+)$/gm;
  while ((m = re2.exec(body)) !== null) {
    const title = m[2].replace(/\*\*/g, "").trim();
    if (!issues.some((i) => i.title === title)) {
      issues.push({ severity: m[1].toLowerCase(), title });
    }
  }
  return issues;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(`keel status — critique / ship / detector pulse

Usage:
  node status.js [--json] [--detect] [--slug=name] [path]

Exit: 0 clean, 2 open P0/P1 (or detector primary), 1 error
`);
    process.exit(0);
  }

  const root = process.cwd();
  const targetPath = args.paths[0] || ".";
  const slug =
    args.slug ||
    (targetPath === "." ? "root" : path.basename(path.resolve(root, targetPath)).replace(/[^\w-]+/g, "-"));

  const all = listCritiques(root, null);
  const forSlug = all.filter((c) => c.slug === slug || c.file.includes(`__${slug}.md`));
  const series = (forSlug.length ? forSlug : all.filter((c) => !args.slug)).slice(-5);
  const latest = series[series.length - 1] || null;

  const scores = series
    .map((c) => {
      const t = Number(c.meta.total_score);
      const max = Number(c.meta.max_score) || 32;
      return Number.isFinite(t) ? `${t}/${max}` : null;
    })
    .filter(Boolean);

  const closed =
    latest &&
    (String(latest.meta.closed_by || "").toLowerCase() === "ship" ||
      String(latest.meta.status || "").toLowerCase() === "closed");

  let issues = latest ? openIssuesFromBody(latest.body) : [];
  if (closed) issues = [];

  const p0 = issues.filter((i) => i.severity === "p0").length;
  const p1 = issues.filter((i) => i.severity === "p1").length;
  const p2 = issues.filter((i) => i.severity === "p2").length;

  let detector = null;
  if (args.detect) {
    const script = path.join(__dirname, "detect.js");
    const r = spawnSync(process.execPath, [script, "--json", targetPath], {
      encoding: "utf8",
      cwd: root,
    });
    try {
      detector = JSON.parse(r.stdout || "{}");
    } catch {
      detector = { ok: false, error: "detect parse failed", stderr: r.stderr };
    }
  }

  const surface = path.join(root, ".keel", "surfaces", `${slug}.md`);
  const payload = {
    ok: true,
    slug,
    targetPath,
    latest: latest
      ? {
          file: latest.file,
          total_score: latest.meta.total_score ?? null,
          max_score: latest.meta.max_score ?? "32",
          closed_by: latest.meta.closed_by ?? null,
          status: latest.meta.status ?? (closed ? "closed" : "open"),
          p0_count: latest.meta.p0_count ?? p0,
          p1_count: latest.meta.p1_count ?? p1,
        }
      : null,
    trend: scores,
    openIssues: issues,
    ship: closed ? "closed" : latest ? "open" : "no snapshot",
    surface: fs.existsSync(surface) ? path.relative(root, surface) : null,
    detector: detector
      ? {
          findingCount: detector.findingCount ?? 0,
          primaryCount: detector.primaryCount ?? 0,
        }
      : null,
  };

  if (args.json) {
    console.log(JSON.stringify(payload, null, 2));
  } else {
    console.log(`## Keel status — ${slug}`);
    console.log("");
    if (!latest) {
      console.log("Score: no critique snapshot yet");
    } else {
      console.log(
        `Score: ${latest.meta.total_score ?? "?"}/${latest.meta.max_score ?? 32}` +
          (scores.length > 1 ? ` · Trend: ${scores.join(" → ")}` : " · First run"),
      );
    }
    console.log(`Open: ${p0} P0 · ${p1} P1 · ${p2} P2`);
    console.log(`Ship: ${payload.ship}`);
    if (detector) {
      console.log(`Detector: ${detector.primaryCount ?? 0} primary on ${targetPath}`);
    }
    console.log(`Surfaces: ${payload.surface || "missing"}`);
    if (issues.length) {
      console.log("");
      console.log("### Open issues");
      for (const i of issues.slice(0, 12)) {
        console.log(`- [${i.severity.toUpperCase()}] ${i.title}`);
      }
    }
  }

  const detPrimary = detector?.primaryCount ?? 0;
  process.exit(p0 + p1 > 0 || detPrimary > 0 ? 2 : 0);
}

main();
