import "server-only";
import { mkdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import type { ReviewStatus, VocabularyUnit } from "@/lib/types";

let database: DatabaseSync | null = null;

function resolveDatabasePath() {
  const configured =
    process.env.KALIMA_DATABASE_PATH ||
    process.env.NOUR_DATABASE_PATH ||
    "./data/kalima.db";
  return path.isAbsolute(configured)
    ? configured
    : path.resolve(/* turbopackIgnore: true */ process.cwd(), configured);
}

export function getDatabase() {
  if (database) return database;
  const databasePath = resolveDatabasePath();
  mkdirSync(path.dirname(databasePath), { recursive: true });
  database = new DatabaseSync(databasePath);
  database.exec(
    readFileSync(
      path.join(process.cwd(), "database", "migrations", "001_initial.sql"),
      "utf8",
    ),
  );
  database.exec(
    readFileSync(path.join(process.cwd(), "database", "seed.sql"), "utf8"),
  );
  return database;
}

export function getDatabaseLocation() {
  return resolveDatabasePath();
}

export function syncVocabularyReviewQueue(units: VocabularyUnit[]) {
  const db = getDatabase();
  const insert = db.prepare(
    `insert or ignore into content_items
      (id, content_type, reference, payload, source_ids, status, author)
     values (?, 'vocabulary', ?, ?, ?, ?, 'Quran.Foundation + Quranic Arabic Corpus')`,
  );
  db.exec("begin immediate");
  try {
    for (const unit of units) {
      insert.run(
        `vocabulary:${unit.id}`,
        unit.examples[0] || unit.id,
        JSON.stringify(unit),
        JSON.stringify(unit.sourceIds),
        unit.status,
      );
    }
    db.exec("commit");
  } catch (error) {
    db.exec("rollback");
    throw error;
  }
}

export function getVocabularyReviewQueue() {
  const rows = getDatabase()
    .prepare(
      `select id, reference, payload, source_ids, status, updated_at
       from content_items
       where content_type = 'vocabulary'
       order by
         case status when 'needs_review' then 0 when 'rejected' then 1 else 2 end,
         reference asc`,
    )
    .all() as Array<{
      id: string;
      reference: string;
      payload: string;
      source_ids: string;
      status: ReviewStatus;
      updated_at: string;
    }>;

  return rows.map((row) => ({
    id: row.id,
    reference: row.reference,
    unit: JSON.parse(row.payload) as VocabularyUnit,
    sourceIds: JSON.parse(row.source_ids) as string[],
    status: row.status,
    updatedAt: row.updated_at,
  }));
}
