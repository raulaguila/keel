/**
 * Shared provider registry for Keel / Bridge skill install.
 * Paths follow Agent Skills + Impeccable-compatible harness dirs.
 */
export const PROVIDER_CATALOG = {
  cursor: {
    label: "Cursor",
    dir: (name) => `.cursor/skills/${name}`,
    invoke: (name) => `/${name}`,
    hooks: "cursor",
  },
  claude: {
    label: "Claude Code",
    aliases: ["claude-code"],
    dir: (name) => `.claude/skills/${name}`,
    invoke: (name) => `/${name}`,
    hooks: "claude",
  },
  agents: {
    label: "OpenAI Agents / Codex repo skills",
    dir: (name) => `.agents/skills/${name}`,
    invoke: (name) => `/${name}`,
  },
  codex: {
    label: "Codex (CLI)",
    dir: (name) => `.agents/skills/${name}`,
    // also mirror under .codex for harnesses that read there
    extraDirs: (name) => [`.codex/skills/${name}`],
    invoke: (name) => `/${name}`,
    hooks: "codex",
  },
  gemini: {
    label: "Gemini CLI",
    dir: (name) => `.gemini/skills/${name}`,
    invoke: (name) => `/${name}`,
  },
  copilot: {
    label: "GitHub Copilot",
    aliases: ["github"],
    dir: (name) => `.github/skills/${name}`,
    invoke: (name) => `/${name}`,
    hooks: "copilot",
  },
  opencode: {
    label: "OpenCode",
    dir: (name) => `.opencode/skills/${name}`,
    invoke: (name) => `/${name}`,
  },
  windsurf: {
    label: "Windsurf",
    dir: (name) => `.windsurf/skills/${name}`,
    invoke: (name) => `/${name}`,
  },
  continue: {
    label: "Continue",
    dir: (name) => `.continue/skills/${name}`,
    invoke: (name) => `/${name}`,
  },
  cline: {
    label: "Cline",
    dir: (name) => `.cline/skills/${name}`,
    // alternate project path Cline also discovers
    extraDirs: (name) => [`.clinerules/skills/${name}`],
    invoke: (name) => `/${name}`,
  },
  kiro: {
    label: "Kiro",
    dir: (name) => `.kiro/skills/${name}`,
    invoke: (name) => `/${name}`,
  },
  pi: {
    label: "Pi",
    dir: (name) => `.pi/skills/${name}`,
    invoke: (name) => `/${name}`,
  },
  trae: {
    label: "Trae",
    dir: (name) => `.trae/skills/${name}`,
    invoke: (name) => `/${name}`,
  },
  "trae-cn": {
    label: "Trae China",
    dir: (name) => `.trae-cn/skills/${name}`,
    invoke: (name) => `/${name}`,
  },
  grok: {
    label: "Grok Build",
    dir: (name) => `.grok/skills/${name}`,
    invoke: (name) => `/${name}`,
    hooks: "grok",
  },
  hermes: {
    label: "Hermes Agent",
    dir: (name) => `.hermes/skills/${name}`,
    invoke: (name) => `/${name}`,
  },
  dsh: {
    label: "DeepSeek Harness",
    dir: (name) => `.dsh/skills/${name}`,
    invoke: (name) => `/${name}`,
  },
  qoder: {
    label: "Qoder",
    dir: (name) => `.qoder/skills/${name}`,
    invoke: (name) => `/${name}`,
  },
  "rovo-dev": {
    label: "Rovo Dev",
    aliases: ["rovodev"],
    dir: (name) => `.rovodev/skills/${name}`,
    invoke: (name) => `/${name}`,
  },
  vibe: {
    label: "Mistral Vibe",
    dir: (name) => `.vibe/skills/${name}`,
    invoke: (name) => `/${name}`,
  },
  veto: {
    label: "Veto",
    dir: (name) => `.veto/skills/${name}`,
    invoke: (name) => `/${name}`,
  },
  antigravity: {
    label: "Antigravity",
    dir: (name) => `.agent/skills/${name}`,
    invoke: (name) => `/${name}`,
  },
  aider: {
    label: "Aider (manual skill path)",
    dir: (name) => `.aider/skills/${name}`,
    invoke: (name) => `(load ${name} skill manually)`,
  },
};

export function resolveProviderKey(raw) {
  const k = String(raw || "").trim().toLowerCase();
  if (!k) return null;
  if (k === "all") return "all";
  if (PROVIDER_CATALOG[k]) return k;
  for (const [id, spec] of Object.entries(PROVIDER_CATALOG)) {
    if ((spec.aliases || []).includes(k)) return id;
  }
  return null;
}

export function listProviderIds() {
  return Object.keys(PROVIDER_CATALOG);
}

export function expandProviders(list) {
  const out = [];
  const seen = new Set();
  for (const raw of list) {
    const key = resolveProviderKey(raw);
    if (key === "all") {
      for (const id of listProviderIds()) {
        if (!seen.has(id)) {
          seen.add(id);
          out.push(id);
        }
      }
      continue;
    }
    if (!key) throw new Error(`unknown provider: ${raw}`);
    if (!seen.has(key)) {
      seen.add(key);
      out.push(key);
    }
  }
  return out;
}
