import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export async function openDb() {
  const db = await open({
    filename: process.env.CONFIG_DB_PATH || '/data/config.db',
    driver: sqlite3.Database,
  });

  // Tabloları Otomatik Oluştur (Yoksa)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS machines (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      type TEXT,
      endpoint TEXT
    );

    CREATE TABLE IF NOT EXISTS parameters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      machine_id INTEGER,
      node_id TEXT,
      name TEXT,
      data_type TEXT,
      unit TEXT,
      FOREIGN KEY(machine_id) REFERENCES machines(id) ON DELETE CASCADE
    );
  `);

  return db;
}