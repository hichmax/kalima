import { headers } from "next/headers";
import { auth, isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** Indique seulement si la personne connectée est administratrice (pour afficher le lien). */
export async function GET() {
  const session = await auth.api.getSession({ headers: await headers(), query: { disableCookieCache: true } });
  return Response.json({ admin: isAdmin(session?.user) }, { headers: { "Cache-Control": "no-store" } });
}
