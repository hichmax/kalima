import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  adminSessionCookie,
  isAdminSessionAuthorized,
} from "@/lib/admin-auth";
import { getDatabase } from "@/lib/database";

export const runtime = "nodejs";

export async function GET() {
  const cookieStore = await cookies();
  if (
    !isAdminSessionAuthorized(cookieStore.get(adminSessionCookie)?.value)
  ) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 401 });
  }
  const rows = getDatabase()
    .prepare(
      `select ci.id, ci.content_type, ci.reference, ci.status, ci.payload,
              coalesce(cr.comment, '') as latest_comment
       from content_items ci
       left join content_reviews cr on cr.id = (
         select id from content_reviews
         where content_item_id = ci.id
         order by created_at desc limit 1
       )
       order by ci.updated_at desc`,
    )
    .all() as Array<Record<string, string>>;
  const cells = [
    ["id", "type", "source", "status", "content"],
    ...rows.map((row) => [
      row.id,
      row.content_type,
      row.reference,
      row.status,
      `${row.payload} ${row.latest_comment}`.trim(),
    ]),
  ];
  const csv = cells
    .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
    .join("\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="kalima-content-review.csv"',
    },
  });
}
