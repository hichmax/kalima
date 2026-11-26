import { headers } from "next/headers";
import { auth, pool } from "@/lib/auth";
import { mergeStates, stateSchema } from "@/lib/progress-schema";

/**
 * Progression synchronisée du compte connecté.
 * GET : renvoie le document enregistré (ou null).
 * PUT : fusionne le document envoyé avec celui du serveur (jamais d'écrasement aveugle),
 *       enregistre et renvoie le résultat fusionné.
 */

export const dynamic = "force-dynamic";
const MAX_BYTES = 1_000_000;
const noStore = { "Cache-Control": "no-store" };

async function userId() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user.id ?? null;
}

async function load(id: string) {
  const { rows } = await pool.query<{ data: unknown }>("select data from kalima_progress where user_id = $1", [id]);
  if (!rows[0]) return null;
  const parsed = stateSchema.safeParse(rows[0].data);
  return parsed.success ? parsed.data : null;
}

export async function GET() {
  const id = await userId();
  if (!id) return Response.json({ error: "Non connecté." }, { status: 401, headers: noStore });
  return Response.json({ data: await load(id) }, { headers: noStore });
}

export async function PUT(request: Request) {
  const id = await userId();
  if (!id) return Response.json({ error: "Non connecté." }, { status: 401, headers: noStore });

  const text = await request.text();
  if (text.length > MAX_BYTES) return Response.json({ error: "Progression trop volumineuse." }, { status: 413, headers: noStore });

  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return Response.json({ error: "JSON invalide." }, { status: 400, headers: noStore });
  }
  const parsed = stateSchema.safeParse(json);
  if (!parsed.success) return Response.json({ error: "Format de progression invalide." }, { status: 400, headers: noStore });

  const current = await load(id);
  const merged = current ? mergeStates(parsed.data, current) : parsed.data;
  await pool.query(
    `insert into kalima_progress (user_id, data, updated_at) values ($1, $2, now())
     on conflict (user_id) do update set data = excluded.data, updated_at = now()`,
    [id, JSON.stringify(merged)],
  );
  return Response.json({ data: merged }, { headers: noStore });
}
