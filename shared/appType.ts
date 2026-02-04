import type { Hono, Env } from "hono";
import type { Event, EventDraft } from "./event";
import type { Result } from "./result";

type AppSchema = {
  "/events": {
    $get: {
      input: {};
      output: Result<Event[]>;
      outputFormat: "json";
      status: 200 | 500;
    };
    $post: {
      input: { json: EventDraft };
      output: Result<Event>;
      outputFormat: "json";
      status: 200 | 400 | 500;
    };
  };
  "/events/:id": {
    $put: {
      input: { param: { id: string }; json: EventDraft };
      output: Result<Event>;
      outputFormat: "json";
      status: 200 | 400 | 404 | 500;
    };
    $delete: {
      input: { param: { id: string } };
      output: Result<{ id: string }>;
      outputFormat: "json";
      status: 200 | 400 | 404 | 500;
    };
  };
};

export type AppType = Hono<Env, AppSchema>;
