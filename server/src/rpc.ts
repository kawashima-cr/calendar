import { Hono } from "hono";
import { z } from "zod";
import { dbPromise } from "./db.js";
import { zValidator } from "@hono/zod-validator";

type ErrorCode = "VALIDATION_ERROR" | "NOT_FOUND" | "INTERNAL";
type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: ErrorCode; message: string } };

type EventDraft = {
  title: string;
  allDay: boolean;
  start: string;
  end: string;
};
type Event = EventDraft & { id: string; createdAt: string; updatedAt: string };

const rowToEvent = (row: any): Event => ({
  id: row.id,
  title: row.title,
  allDay: Boolean(row.all_day),
  start: row.start_at,
  end: row.end_at,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const eventDraftSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "タイトルは必須です。")
      .max(30, "タイトルは30文字以内にしてください。"),
    allDay: z.boolean(),
    start: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/),
    end: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/),
  })
  .refine((v) => v.end >= v.start, {
    path: ["end"],
    message: "終了は開始以降にしてください。",
  });

const idParamSchema = z.object({
  id: z.uuid("IDが不正です。"),
});

const onError = (result: any, c: any) =>
  c.json(
    {
      ok: false,
      error: { code: "VALIDATION_ERROR", message: "入力に誤りがあります。" },
    },
    400,
  );

const nowJstString = () => {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(
    d.getHours(),
  )}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
};

const ok = <T>(data: T): Result<T> => ({ ok: true, data });
const err = (code: ErrorCode, message: string): Result<never> => ({
  ok: false,
  error: { code, message },
});
const app = new Hono();

// listEvents
app
  .get("/events", async (c) => {
    const db = await dbPromise;
    const rows = await db.all(
      "SELECT * FROM events ORDER BY start_at ASC, end_at ASC",
    );
    const events = rows.map(rowToEvent);
    return c.json(ok(events));
  })
  // createEvent
  .post("/events", zValidator("json", eventDraftSchema, onError), async (c) => {
    const draft = c.req.valid("json");
    const id = crypto.randomUUID();
    const now = nowJstString();

    const db = await dbPromise;
    await db.run(
      `INSERT INTO events (id, title, start_at, end_at, all_day, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      id,
      draft.title.trim(),
      draft.start,
      draft.end,
      draft.allDay ? 1 : 0,
      now,
      now,
    );

    const row = await db.get("SELECT * FROM events WHERE id = ?", id);
    return c.json(ok(rowToEvent(row)));
  })
  // updateEvent
  .put(
    "/events/:id",
    zValidator("param", idParamSchema, onError),
    zValidator("json", eventDraftSchema, onError),
    async (c) => {
      const { id } = c.req.valid("param");
      const draft = c.req.valid("json");
      const db = await dbPromise;

      const now = nowJstString();
      const exists = await db.get("SELECT id FROM events WHERE id = ?", id);
      if (!exists) {
        return c.json(err("NOT_FOUND", "イベントが見つかりません。"), 404);
      }
      await db.run(
        `UPDATE events
       SET title = ?, start_at = ?, end_at = ?, all_day = ?, updated_at = ?
       WHERE id = ?`,
        draft.title.trim(),
        draft.start,
        draft.end,
        draft.allDay ? 1 : 0,
        now,
        id,
      );

      const row = await db.get("SELECT * FROM events WHERE id = ?", id);
      return c.json(ok(rowToEvent(row)));
    },
  )
  // deleteEvent
  .delete(
    "/events/:id",
    zValidator("param", idParamSchema, onError),
    async (c) => {
      const { id } = c.req.param();
      const db = await dbPromise;

      const exists = await db.get("SELECT id FROM events WHERE id = ?", id);
      if (!exists) {
        return c.json(err("NOT_FOUND", "イベントが見つかりません。"), 404);
      }
      await db.run("DELETE FROM events WHERE id = ?", id);
      return c.json(ok({ id }));
    },
  );

export default app;
