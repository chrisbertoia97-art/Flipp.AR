const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(path.join(__dirname, "..", "flippar.db"));
db.pragma("journal_mode = WAL");

const SCHEMA = `
CREATE TABLE IF NOT EXISTS owner_intakes (
  id TEXT PRIMARY KEY, flow_type TEXT NOT NULL, data TEXT NOT NULL, created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS actors (
  id TEXT PRIMARY KEY, category TEXT NOT NULL, data TEXT NOT NULL, created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS investors (
  id TEXT PRIMARY KEY, flow_type TEXT NOT NULL, data TEXT NOT NULL, created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS providers (
  id TEXT PRIMARY KEY, data TEXT NOT NULL, created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS files (
  id TEXT PRIMARY KEY,
  owner_table TEXT NOT NULL,
  owner_id TEXT NOT NULL,
  field TEXT NOT NULL,
  original_name TEXT NOT NULL,
  stored_path TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  created_at TEXT NOT NULL
);
`;

async function init() {
  db.exec(SCHEMA);
}

async function createRow(table, extraColumn, extraValue, id, dataObj, createdAt) {
  const dataJson = JSON.stringify(dataObj);
  if (extraColumn) {
    db.prepare(`INSERT INTO ${table} (id, ${extraColumn}, data, created_at) VALUES (?, ?, ?, ?)`).run(
      id,
      extraValue,
      dataJson,
      createdAt
    );
  } else {
    db.prepare(`INSERT INTO ${table} (id, data, created_at) VALUES (?, ?, ?)`).run(id, dataJson, createdAt);
  }
}

async function listRows(table) {
  const rows = db.prepare(`SELECT * FROM ${table} ORDER BY created_at DESC`).all();
  return rows.map((r) => ({ ...r, data: JSON.parse(r.data) }));
}

async function getRow(table, id) {
  const r = db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(id);
  return r ? { ...r, data: JSON.parse(r.data) } : null;
}

async function insertFile(meta) {
  db.prepare(
    `INSERT INTO files (id, owner_table, owner_id, field, original_name, stored_path, mime_type, size_bytes, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    meta.id,
    meta.ownerTable,
    meta.ownerId,
    meta.field,
    meta.originalName,
    meta.storedPath,
    meta.mimeType,
    meta.sizeBytes,
    meta.createdAt
  );
}

async function listFiles(ownerTable, ownerId) {
  return db
    .prepare(`SELECT * FROM files WHERE owner_table = ? AND owner_id = ? ORDER BY created_at ASC`)
    .all(ownerTable, ownerId);
}

async function getFile(fileId) {
  return db.prepare(`SELECT * FROM files WHERE id = ?`).get(fileId);
}

module.exports = { init, createRow, listRows, getRow, insertFile, listFiles, getFile, engineName: "sqlite" };
