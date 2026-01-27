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
      all_day INTEGER NOT NULL DEFAULT 0
    );
  `);
}
