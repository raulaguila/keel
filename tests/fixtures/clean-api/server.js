// Clean fixture for smoke test — timeouts, bounds, no swallowed errors.
import express from "express";

const app = express();

app.get("/users", async (req, res) => {
  try {
    const take = Math.min(Number(req.query.limit) || 50, 100);
    const users = await db.user.findMany({ take });
    const ids = users.map((u) => u.id);
    const profiles = await db.profile.findMany({ where: { userId: { in: ids } } });
    res.json({ users, profiles });
  } catch (err) {
    console.error("users_failed", { err: String(err) });
    res.status(500).json({ error: "internal" });
  }
});

app.get("/raw", async (req, res) => {
  const rows = await db.$queryRawUnsafe("SELECT id, email FROM users LIMIT 100");
  res.json(rows);
});

app.post("/proxy", async (req, res) => {
  const r = await fetch("https://example.com/api", {
    signal: AbortSignal.timeout(5_000),
  });
  res.json(await r.json());
});

export default app;
