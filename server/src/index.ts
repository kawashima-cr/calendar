import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { cors } from "hono/cors";
import rpcApp from "./rpc.js";
import "dotenv/config";

const app = new Hono();

app.use("*", cors({ origin: "http://localhost:5173" }));

app.get("/health", (c) => c.text("ok"));

// rpcルート
app.route("/rpc", rpcApp);

const port = 3001;
serve({ fetch: app.fetch, port });

export default app;
