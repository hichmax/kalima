import "server-only";
import vocabulary from "@/data/vocabulary.generated.json";
import { getDatabase } from "@/lib/database";
import type { VocabularyUnit } from "@/lib/types";

export function getVocabularyUnits() {
  const units = vocabulary.units as VocabularyUnit[];
  const approvedRows = getDatabase()
    .prepare(
      `select id, payload, status
       from content_items
       where content_type = 'vocabulary'
         and status in ('approved', 'published')`,
    )
    .all() as Array<{ id: string; payload: string; status: "approved" | "published" }>;
  const approved = new Map(
    approvedRows.map((row) => [
      row.id.replace(/^vocabulary:/u, ""),
      {
        ...(JSON.parse(row.payload) as VocabularyUnit),
        status: row.status,
      },
    ]),
  );
  return units.map((unit) => approved.get(unit.id) || unit);
}
