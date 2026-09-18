#!/usr/bin/env node
/**
 * live-api — probe a running HTTP service (Keel live analog, not browser).
 * Usage: node live-api.js --base=http://127.0.0.1:3000 --path=/health [--method=GET] [--expect=200]
 * Exit: 0 ok, 2 mismatch, 1 error. Fail-open on connection refused → exit 1 with message.
 */
import { parseArgs } from "node:util";

const { values } = parseArgs({
  options: {
    base: { type: "string" },
    path: { type: "string", default: "/health" },
    method: { type: "string", default: "GET" },
    expect: { type: "string", default: "200" },
    timeout: { type: "string", default: "5000" },
    json: { type: "boolean", default: false },
    help: { type: "boolean", default: false },
  },
  allowPositionals: true,
});

if (values.help || !values.base) {
  console.log(`keel live-api

Usage:
  node live-api.js --base=http://127.0.0.1:3000 --path=/health [--method=GET] [--expect=200] [--timeout=5000] [--json]
`);
  process.exit(values.help ? 0 : 1);
}

const url = new URL(values.path || "/health", values.base).toString();
const expect = Number(values.expect);
const ms = Number(values.timeout) || 5000;

try {
  const res = await fetch(url, {
    method: values.method || "GET",
    signal: AbortSignal.timeout(ms),
  });
  const text = await res.text();
  let body = text;
  try {
    body = JSON.parse(text);
  } catch { /* keep text */ }

  const ok = res.status === expect;
  const payload = {
    ok,
    url,
    status: res.status,
    expect,
    bodyPreview: typeof body === "string" ? body.slice(0, 400) : body,
  };
  if (values.json) console.log(JSON.stringify(payload, null, 2));
  else {
    console.log(`${ok ? "OK" : "FAIL"} ${res.status} ${url}`);
    if (typeof body === "object") console.log(JSON.stringify(body, null, 2).slice(0, 500));
    else console.log(String(body).slice(0, 500));
  }
  process.exit(ok ? 0 : 2);
} catch (err) {
  const msg = err && err.message ? err.message : String(err);
  if (values.json) console.log(JSON.stringify({ ok: false, url, error: msg }));
  else console.error(`keel live-api: ${msg}`);
  process.exit(1);
}
