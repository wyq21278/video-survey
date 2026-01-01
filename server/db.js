// server/db.js
import fs from 'fs';
import path from 'path';
import initSqlJs from 'sql.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = process.env.DB_PATH
  ? process.env.DB_PATH
  : path.join(__dirname, '..', 'data', 'survey.sqlite');

const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

let SQL;         // sql.js module
let db;          // Database instance
let writeLock = Promise.resolve(); // 简单串行化写入，防并发写坏文件

async function loadSqlJs() {
  if (SQL) return SQL;
  SQL = await initSqlJs({
    // sql.js 会在 node_modules/sql.js/dist 下找 wasm
    locateFile: (file) => path.join(__dirname, 'node_modules', 'sql.js', 'dist', file)
  });
  return SQL;
}

async function loadDb() {
  const SQL = await loadSqlJs();
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  if (fs.existsSync(DB_PATH)) {
    const filebuf = fs.readFileSync(DB_PATH);
    db = new SQL.Database(filebuf);
  } else {
    db = new SQL.Database();
    const schema = fs.readFileSync(SCHEMA_PATH, 'utf-8');
    db.run(schema);
    flushToDisk();
  }
  return db;
}

function flushToDisk() {
  const data = db.export(); // Uint8Array
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

export async function initDb() {
  await loadDb();
}

export async function withDbWrite(fn) {
  // 所有写操作串行执行，避免并发写文件
  writeLock = writeLock.then(async () => {
    await loadDb();
    await fn(db);
    flushToDisk();
  });
  return writeLock;
}

export async function withDbRead(fn) {
  await loadDb();
  return fn(db);
}
