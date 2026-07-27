import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

const configured =
  process.env.KALIMA_DATABASE_PATH ||
  process.env.NOUR_DATABASE_PATH ||
  "./data/kalima.db";
const databasePath = path.isAbsolute(configured)
  ? configured
  : path.resolve(process.cwd(), configured);

await mkdir(path.dirname(databasePath), { recursive: true });
const database = new DatabaseSync(databasePath);
database.exec(await readFile("database/migrations/001_initial.sql", "utf8"));
database.exec(await readFile("database/seed.sql", "utf8"));
database.close();
console.log(`SQLite database ready: ${databasePath}`);
