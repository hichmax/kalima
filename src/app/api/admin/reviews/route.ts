import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import {
  adminSessionCookie,
  isAdminSessionAuthorized,
} from "@/lib/admin-auth";
import { getDatabase } from "@/lib/database";

export const runtime = "nodejs";

const reviewSchema = z.object({
  contentItemId: z.string().min(1).max(120),
  nextStatus: z.enum(["approved", "rejected"]),
  comment: z.string().trim().min(3).max(2000),
  payload: z.record(z.string(), z.unknown()),
});

export async function POST(request: Request) {
  const cookieStore = await cookies();
  if (
    !isAdminSessionAuthorized(cookieStore.get(adminSessionCookie)?.value)
  ) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 401 });
  }
  const body = reviewSchema.safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json({ error: "Décision invalide" }, { status: 422 });
  }
  const db = getDatabase();
  const current = db
    .prepare("select status from content_items where id = ?")
    .get(body.data.contentItemId) as { status: string } | undefined;
  if (!current) return NextResponse.json({ error: "Contenu introuvable" }, { status: 404 });

  db.exec("begin immediate");
  try {
    db.prepare(
      `update content_items
       set status = ?, payload = ?, updated_at = datetime('now')
       where id = ?`,
    ).run(
      body.data.nextStatus,
      JSON.stringify(body.data.payload),
      body.data.contentItemId,
    );
    db.prepare(
      `insert into content_reviews
        (id, content_item_id, reviewer, previous_status, next_status, comment)
       values (?, ?, ?, ?, ?, ?)`,
    ).run(
      randomUUID(),
      body.data.contentItemId,
      "internal-review-token",
      current.status,
      body.data.nextStatus,
      body.data.comment,
    );
    db.exec("commit");
  } catch (error) {
    db.exec("rollback");
    throw error;
  }
  return NextResponse.json({ saved: true, storage: "sqlite-local" });
}
