// Intentionally smelly fixture for detector oracle — DO NOT copy to production.
import express from "express";

const API_KEY = "sk_live_this_is_a_fake_secret_key_123456";

const app = express();

app.get("/users", async (req, res) => {
  try {
    const users = await db.user.findMany();
    const enriched = [];
    for (const u of users) {
      enriched.push(await db.profile.findUnique({ where: { userId: u.id } }));
    }
    res.json(enriched);
  } catch (e) {}
});

app.get("/raw", async (req, res) => {
  const rows = await db.$queryRawUnsafe("SELECT * FROM users");
  console.log(process.env.DATABASE_URL);
  res.json(rows);
});

app.post("/proxy", async (req, res) => {
  const r = await fetch("https://example.com/api");
  res.json(await r.json());
});

export default app;
