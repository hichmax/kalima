import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { pool } from "@/lib/auth";

/**
 * Espace administrateur caché : accessible seulement en tapant /admin, avec le mot de passe
 * défini dans la variable MDP_KALIMA. Après saisie, un cookie signé (HMAC) ouvre l'accès 12 h.
 * Changer MDP_KALIMA invalide immédiatement tous les cookies existants.
 * Anti-force brute : 5 essais ratés par adresse IP et par quart d'heure.
 */

export const ADMIN_COOKIE = "kalima_admin";
const TTL_SECONDS = 12 * 60 * 60;
const MAX_FAILURES = 5;
const WINDOW_MINUTES = 15;

export const adminEnabled = () => Boolean(process.env.MDP_KALIMA);

function key() {
  return `${process.env.BETTER_AUTH_SECRET ?? ""}:${process.env.MDP_KALIMA ?? ""}`;
}

function sign(payload: string) {
  return createHmac("sha256", key()).update(payload).digest("base64url");
}

/** Comparaison à temps constant (les deux côtés sont hachés : longueurs égales). */
export function passwordMatches(candidate: string) {
  const expected = process.env.MDP_KALIMA;
  if (!expected) return false;
  const a = createHash("sha256").update(candidate).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}

export function createAdminToken(now = Date.now()) {
  const expires = String(Math.floor(now / 1000) + TTL_SECONDS);
  return { value: `${expires}.${sign(expires)}`, maxAge: TTL_SECONDS };
}

export function isValidAdminToken(token: string | undefined, now = Date.now()) {
  if (!token || !adminEnabled()) return false;
  const [expires, signature] = token.split(".");
  if (!expires || !signature) return false;
  const expected = Buffer.from(sign(expires));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return false;
  return Number(expires) * 1000 > now;
}

async function ensureTable() {
  await pool.query(`create table if not exists kalima_admin_throttle (
    ip text primary key, failures int not null default 0, window_start timestamptz not null default now())`);
}

/** Vrai si l'IP a encore droit à un essai. */
export async function canTry(ip: string) {
  await ensureTable();
  const { rows } = await pool.query<{ failures: number; fresh: boolean }>(
    `select failures, window_start > now() - interval '${WINDOW_MINUTES} minutes' as fresh from kalima_admin_throttle where ip = $1`,
    [ip],
  );
  const row = rows[0];
  return !row || !row.fresh || row.failures < MAX_FAILURES;
}

export async function recordFailure(ip: string) {
  await pool.query(
    `insert into kalima_admin_throttle (ip, failures, window_start) values ($1, 1, now())
     on conflict (ip) do update set
       failures = case when kalima_admin_throttle.window_start > now() - interval '${WINDOW_MINUTES} minutes'
                       then kalima_admin_throttle.failures + 1 else 1 end,
       window_start = case when kalima_admin_throttle.window_start > now() - interval '${WINDOW_MINUTES} minutes'
                       then kalima_admin_throttle.window_start else now() end`,
    [ip],
  );
}

export async function clearFailures(ip: string) {
  await pool.query("delete from kalima_admin_throttle where ip = $1", [ip]);
}

export function clientIp(headers: Headers) {
  return headers.get("x-forwarded-for")?.split(",")[0]?.trim() || headers.get("x-real-ip") || "inconnue";
}
