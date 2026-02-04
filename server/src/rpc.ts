import { Hono } from "hono";
import type { Env } from "hono";
import { z } from "zod";
import { zValidator, type Hook } from "@hono/zod-validator";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import type { Result, ErrorCode, ErrResult } from "../../shared/result.js";
import type { EventDraft } from "../../shared/event.js";

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL!,
  // authToken はローカルSQLiteなら不要
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

const onError: Hook<unknown, Env, string, any, ErrResult> = (_result, c) => {
  if (_result.success) return;
  return c.json(
    {
      ok: false,
      error: { code: "VALIDATION_ERROR", message: "入力に誤りがあります。" },
    },
    400,
  );
};

const nowJstString = () => {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(
    d.getHours(),
  )}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
};

const ok = <T>(data: T): Result<T> => ({ ok: true, data });
const err = (code: ErrorCode, message: string): ErrResult => ({
  ok: false,
  error: { code, message },
});

const prisma = new PrismaClient({ adapter });

const app = new Hono()
  // listEvents
  .get("/events", async (c) => {
    try {
      const events = await prisma.event.findMany({
        orderBy: [{ start: "asc" }, { end: "asc" }],
      });
      return c.json(ok(events));
    } catch (e) {
      console.error(e);

      return c.json(err("INTERNAL", "取得に失敗しました。"), 500);
    }
  })
  // createEvent
  .post("/events", zValidator("json", eventDraftSchema, onError), async (c) => {
    const draft = c.req.valid("json");
    const now = nowJstString();
    try {
      const created = await prisma.event.create({
        data: {
          title: draft.title.trim(),
          allDay: draft.allDay,
          start: draft.start,
          end: draft.end,
          createdAt: now,
          updatedAt: now,
        },
      });
      return c.json(ok(created));
    } catch (e) {
      console.error(e);

      return c.json(err("INTERNAL", "作成に失敗しました。"), 500);
    }
  })
  // updateEvent
  .put(
    "/events/:id",
    zValidator("param", idParamSchema, onError),
    zValidator("json", eventDraftSchema, onError),
    async (c) => {
      const { id } = c.req.valid("param");
      const draft = c.req.valid("json");

      const now = nowJstString();
      try {
        const exists = await prisma.event.findUnique({ where: { id } });
        if (!exists) {
          return c.json(err("NOT_FOUND", "イベントが見つかりません。"), 404);
        }

        const updated = await prisma.event.update({
          where: { id },
          data: {
            title: draft.title.trim(),
            allDay: draft.allDay,
            start: draft.start,
            end: draft.end,
            updatedAt: now,
          },
        });
        return c.json(ok(updated));
      } catch (e) {
        console.error(e);

        return c.json(err("INTERNAL", "更新に失敗しました。"), 500);
      }
    },
  )
  // deleteEvent
  .delete(
    "/events/:id",
    zValidator("param", idParamSchema, onError),
    async (c) => {
      const { id } = c.req.valid("param");
      try {
        const exists = await prisma.event.findUnique({ where: { id } });
        if (!exists) {
          return c.json(err("NOT_FOUND", "イベントが見つかりません。"), 404);
        }

        await prisma.event.delete({ where: { id } });
        return c.json(ok({ id }));
      } catch (e) {
        console.error(e);

        return c.json(err("INTERNAL", "削除に失敗しました。"), 500);
      }
    },
  );

export type AppType = typeof app;
export default app;
