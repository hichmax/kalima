// Crée la table de progression synchronisée (à lancer une fois après `npx auth@1.7.28 migrate`).
// Usage : node --env-file=.env.local scripts/db-setup.mjs
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
await pool.query(`create table if not exists kalima_progress (
  user_id text primary key references "user"(id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now()
)`);
const { rows } = await pool.query("select table_name from information_schema.tables where table_schema = 'public' order by 1");
console.log("tables :", rows.map((r) => r.table_name).join(", "));
await pool.end();
