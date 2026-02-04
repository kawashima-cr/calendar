import type { AppType } from "../../shared/appType";
import { hc } from "hono/client";
import type { Event, EventDraft } from "@shared/event";
import type { Result } from "@shared/result";

const client = hc<AppType>("http://localhost:3001/rpc");

const toResult = async <T>(res: Response): Promise<Result<T>> => {
  return (await res.json()) as Result<T>;
};

export const listEvents = async (): Promise<Result<Event[]>> => {
  const res = await client.events.$get();
  return toResult<Event[]>(res);
};

export const createEvent = async (
  draft: EventDraft,
): Promise<Result<Event>> => {
  const res = await client.events.$post({ json: draft });
  return toResult<Event>(res);
};

export const updateEvent = async (
  id: string,
  draft: EventDraft,
): Promise<Result<Event>> => {
  const res = await client.events[":id"].$put({ param: { id }, json: draft });
  return toResult<Event>(res);
};

export const deleteEvent = async (
  id: string,
): Promise<Result<{ id: string }>> => {
  const res = await client.events[":id"].$delete({ param: { id } });
  return toResult<{ id: string }>(res);
};
