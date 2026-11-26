import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { Pool } from "pg";
import { sendPasswordReset } from "@/lib/mail";

/**
 * Comptes Kalima (Better Auth, données dans notre propre base Neon Postgres).
 * Doc : https://better-auth.com/docs — version épinglée 1.7.28.
 *
 * - E-mail + mot de passe (8 caractères minimum, haché par Better Auth avec scrypt).
 * - Google seulement si GOOGLE_CLIENT_ID et GOOGLE_CLIENT_SECRET sont définis.
 * - Session mise en cache dans un cookie signé (5 min) : la plupart des requêtes évitent la base.
 * - Limitation de débit stockée en base : partagée entre toutes les instances Vercel.
 */

const globalForPool = globalThis as unknown as { kalimaPool?: Pool };

export const pool =
  globalForPool.kalimaPool ??
  new Pool({ connectionString: process.env.DATABASE_URL, max: 5, idleTimeoutMillis: 10_000 });
if (process.env.NODE_ENV !== "production") globalForPool.kalimaPool = pool;

const google =
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? { google: { clientId: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET, prompt: "select_account" as const } }
    : {};

export const googleEnabled = Object.keys(google).length > 0;

export const auth = betterAuth({
  appName: "Kalima",
  database: pool,
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    autoSignIn: true,
    // Mot de passe oublié : lien valable une heure, toutes les sessions sont fermées après le changement.
    resetPasswordTokenExpiresIn: 60 * 60,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      await sendPasswordReset(user.email, user.name, url);
    },
  },
  socialProviders: google,
  session: {
    expiresIn: 60 * 60 * 24 * 60, // 60 jours
    updateAge: 60 * 60 * 24,
    cookieCache: { enabled: true, maxAge: 5 * 60 },
  },
  rateLimit: { enabled: true, storage: "database", window: 60, max: 60 },
  user: {
    // Suppression du compte (RGPD) : mot de passe demandé (ou session de moins d'un jour pour un
    // compte Google) ; la progression part avec (ON DELETE CASCADE).
    deleteUser: { enabled: true },
    // Consentement explicite aux e-mails de Kalima (case non cochée par défaut, retirable dans « Mon compte »).
    additionalFields: { newsletter: { type: "boolean", required: false, defaultValue: false, input: true } },
  },
  // Liaison Google ↔ compte e-mail : Better Auth ne relie que si l'e-mail local est vérifié
  // (requireLocalEmailVerified, par défaut) : personne ne peut « réserver » l'adresse d'un autre.
  account: { accountLinking: { enabled: true, requireLocalEmailVerified: true } },
  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;

/** Administrateurs : e-mails listés dans ADMIN_EMAILS (séparés par des virgules) ET vérifiés (Google). */
export function isAdmin(user: { email: string; emailVerified: boolean } | null | undefined) {
  if (!user?.emailVerified) return false;
  const admins = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
  return admins.includes(user.email.toLowerCase());
}
