import { Hono } from "hono";
import { serve } from "@hono/node-server";

type User = { id: string; name: string; createdAt: string };

const app = new Hono();

/** 疑似DB（メモリ） */
const users = new Map(); // id -> { id, name, createdAt }
const nowIso = () => new Date().toISOString();

app.get("/hello/:name", (c) => {
  const name = c.req.param("name"); // /hello/:name
  const lang = c.req.query("lang") ?? "ja"; // ?lang=...

  const msg = lang === "en" ? `Hello, ${name}!` : `やあ、${name}！`;
  return c.json({ message: msg });
});

app.post("/echo", async (c) => {
  const body = await c.req.json().catch(() => null);
  if (!body || typeof body.message !== "string") {
    return c.json({ error: "string型にしてください" });
  }

  return c.json({ received: body.message });
});

// 一覧
app.get("/users", (c) => {
  return c.json({ users: [...users.values()] });
});

// 取得
app.get("/users/:id", (c) => {
  const id = c.req.param("id");
  const user = users.get(id);
  if (!user) return c.json({ error: "ユーザーが見つかりません" }, 404);
  return c.json({ user: user });
});

// 作成
app.post("/users", async (c) => {
  const body = await c.req.json().catch(() => null);
  const name = body?.name;

  if (!name || typeof name !== "string") {
    return c.json({ error: "文字を入力してください" }, 400);
  }

  const id = crypto.randomUUID();
  const user = { id, name, createdAt: nowIso() };
  users.set(id, user);

  return c.json(user, 201);
});

// 部分更新
app.patch("/users/:id", async (c) => {
  const id = c.req.param("id");
  const user = users.get(id);
  if (!user) return c.json({ error: "user not found" }, 404);

  const body = await c.req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return c.json({ error: "body must be json object" }, 400);
  }

  const patch: { name?: string } = {};

  if ("name" in body) {
    if (typeof body.name !== "string") {
      return c.json({ error: "name must be string" }, 400);
    }
    patch.name = body.name;
  }

  const updated = { ...user, ...patch };
  users.set(id, updated);

  return c.json({ updated });
});

// 削除
app.delete("/users/:id", (c) => {
  const id = c.req.param("id");
  const existed = users.delete(id);

  if (!existed) return c.json({ error: "存在しないユーザーです。" }, 400);

  return c.json({ ok: true });
});

serve({ fetch: app.fetch, port: 3000 });
console.log("http://localhost:3000");
