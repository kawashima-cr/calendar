import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { cors } from "hono/cors";
import { dbPromise, initDb } from "./db.js";

const app = new Hono();

app.use("*", cors({ origin: "http://localhost:5173" }));

app.get("/health", (c) => c.text("ok"));

app.get("/events", async (c) => {
  const db = await dbPromise;
  const rows = await db.all("SELECT * FROM events ORDER BY start_at");
  return c.json(rows);
});

const port = 3001;
serve({ fetch: app.fetch, port });

initDb().catch((err: any) => {
  console.error(err);
  process.exit(1);
});
