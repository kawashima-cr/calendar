import { Hono } from "hono";

type User = { id: string; name: string };

const app = new Hono();

app.get("/users/:id", (c) => {
  const id = c.req.param("id");
  const user: User = { id, name: "Taro" };
  return c.json(user);
});

app.post("/users", async (c) => {
  const body = await c.req.json<{ name: string }>();
  const created: User = { id: "u_123", name: body.name };
  return c.json(created, 201);
});

export default app;
