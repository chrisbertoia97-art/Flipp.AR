const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Muchos proveedores gestionados (Render, Supabase, Neon) requieren SSL pero con
  // certificado no verificado por defecto. Si es una conexión local, se desactiva.
  ssl: /localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL || "") ? false : { rejectUnauthorized: false },
});

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
  size_bytes BIGINT NOT NULL,
  created_at TEXT NOT NULL
);
`;

async function init() {
  await pool.query(SCHEMA);
}

async function createRow(table, extraColumn, extraValue, id, dataObj, createdAt) {
  const dataJson = JSON.stringify(dataObj);
  if (extraColumn) {
    await pool.query(`INSERT INTO ${table} (id, ${extraColumn}, data, created_at) VALUES ($1,$2,$3,$4)`, [
      id,
      extraValue,
      dataJson,
      createdAt,
    ]);
  } else {
    await pool.query(`INSERT INTO ${table} (id, data, created_at) VALUES ($1,$2,$3)`, [id, dataJson, createdAt]);
  }
}

async function listRows(table) {
  const res = await pool.query(`SELECT * FROM ${table} ORDER BY created_at DESC`);
  return res.rows.map((r) => ({ ...r, data: JSON.parse(r.data) }));
}

async function getRow(table, id) {
  const res = await pool.query(`SELECT * FROM ${table} WHERE id = $1`, [id]);
  const r = res.rows[0];
  return r ? { ...r, data: JSON.parse(r.data) } : null;
}

async function insertFile(meta) {
  await pool.query(
    `INSERT INTO files (id, owner_table, owner_id, field, original_name, stored_path, mime_type, size_bytes, created_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
    [meta.id, meta.ownerTable, meta.ownerId, meta.field, meta.originalName, meta.storedPath, meta.mimeType, meta.sizeBytes, meta.createdAt]
  );
}

async function listFiles(ownerTable, ownerId) {
  const res = await pool.query(
    `SELECT * FROM files WHERE owner_table = $1 AND owner_id = $2 ORDER BY created_at ASC`,
    [ownerTable, ownerId]
  );
  return res.rows;
}

async function getFile(fileId) {
  const res = await pool.query(`SELECT * FROM files WHERE id = $1`, [fileId]);
  return res.rows[0];
}

module.exports = { init, createRow, listRows, getRow, insertFile, listFiles, getFile, engineName: "postgres" };
