import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { cors } from "hono/cors";
import { initDb } from "./db.js";
import rpcApp from "./rpc.js";

const app = new Hono();

app.use("*", cors({ origin: "http://localhost:5173" }));

app.get("/health", (c) => c.text("ok"));

// rpcルート
app.route("/rpc", rpcApp);

const port = 3001;
serve({ fetch: app.fetch, port });

initDb().catch((err: any) => {
  console.error(err);
  process.exit(1);
});

export default app;
