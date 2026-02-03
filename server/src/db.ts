import sqlite3 from "sqlite3";
import { open } from "sqlite";

export const dbPromise = open({
  filename: "./events.sqlite",
  driver: sqlite3.Database,
});

export async function initDb() {
  const db = await dbPromise;
  await db.exec(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      start_at TEXT NOT NULL,
      end_at TEXT NOT NULL,
      all_day INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  const columns = await db.all<{ name: string }[]>("PRAGMA table_info(events)");
  const columnNames = new Set(columns.map((c) => c.name));

  if (!columnNames.has("created_at")) {
    await db.exec(
      "ALTER TABLE events ADD COLUMN created_at TEXT NOT NULL DEFAULT '';",
    );
  }

  if (!columnNames.has("updated_at")) {
    await db.exec(
      "ALTER TABLE events ADD COLUMN updated_at TEXT NOT NULL DEFAULT '';",
    );
  }
}
