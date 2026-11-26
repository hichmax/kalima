import { cookies } from "next/headers";
import { ADMIN_COOKIE, adminEnabled, canTry, clearFailures, clientIp, createAdminToken, passwordMatches, recordFailure } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";
const noStore = { "Cache-Control": "no-store" };

/** POST { password } : ouvre l'espace administrateur. DELETE : le referme. */
export async function POST(request: Request) {
  if (!adminEnabled()) return new Response(null, { status: 404 });
  const ip = clientIp(request.headers);
  if (!(await canTry(ip))) return Response.json({ error: "Trop d'essais. Réessaie dans un quart d'heure." }, { status: 429, headers: noStore });

  const body = (await request.json().catch(() => null)) as { password?: unknown } | null;
  const password = typeof body?.password === "string" ? body.password.slice(0, 200) : "";
  if (!passwordMatches(password)) {
    await recordFailure(ip);
    await new Promise((resolve) => setTimeout(resolve, 600));
    return Response.json({ error: "Mot de passe incorrect." }, { status: 401, headers: noStore });
  }

  await clearFailures(ip);
  const token = createAdminToken();
  (await cookies()).set(ADMIN_COOKIE, token.value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: token.maxAge,
  });
  return Response.json({ ok: true }, { headers: noStore });
}

export async function DELETE() {
  (await cookies()).delete(ADMIN_COOKIE);
  return Response.json({ ok: true }, { headers: noStore });
}
