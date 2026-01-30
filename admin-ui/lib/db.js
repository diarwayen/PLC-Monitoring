// admin-ui/lib/db.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Docker içinde '/data', yerelde proje kökü
const dbPath = process.env.CONFIG_DB_PATH || path.resolve(process.cwd(), 'config.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Veritabanına bağlanılamadı:', err.message);
  } else {
    console.log('SQLite veritabanına bağlanıldı:', dbPath);
    initDb();
  }
});

function initDb() {
  // Makineler tablosu
  db.run(`CREATE TABLE IF NOT EXISTS machines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    endpoint TEXT NOT NULL,
    type TEXT,
    interval INTEGER DEFAULT 1000
  )`);
  
  // Eşik değerler (Thresholds) tablosu
  db.run(`CREATE TABLE IF NOT EXISTS thresholds (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    machine_id INTEGER,
    metric TEXT,
    min_val REAL,
    max_val REAL,
    FOREIGN KEY(machine_id) REFERENCES machines(id)
  )`);
}

module.exports = db;