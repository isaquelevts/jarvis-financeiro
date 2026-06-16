import dotenv from "dotenv";
import { fileURLToPath } from "node:url";
import pg from "pg";

dotenv.config({ path: fileURLToPath(new URL("../../../.env", import.meta.url)) });
dotenv.config();

const { Pool } = pg;

const connectionString =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.STORAGE_URL ||
  "postgres://jarvis:jarvis@localhost:5432/jarvis_financeiro";

const ssl = !connectionString.includes("localhost") && !connectionString.includes("127.0.0.1")
  ? { rejectUnauthorized: false }
  : false;

export const pool = new Pool({
  connectionString,
  ssl,
});

export async function query(text, params) {
  return pool.query(text, params);
}

export async function closePool() {
  await pool.end();
}

