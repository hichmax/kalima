import type { Metadata } from "next";
import { AuthScreen } from "@/components/auth-screen";
import { mailEnabled } from "@/lib/mail";
import "./auth.css";

export const metadata: Metadata = {
  title: "Connexion",
  description: "Connecte-toi pour retrouver ta progression Kalima sur tous tes appareils.",
  robots: { index: false },
};

/** N'accepte qu'un chemin interne comme destination après connexion (pas de redirection ouverte). */
function safeNext(value: string | string[] | undefined) {
  const next = Array.isArray(value) ? value[0] : value;
  return next && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\") ? next : "/aujourdhui";
}

/** Erreurs renvoyées par Better Auth après un aller-retour Google (?error=…). */
function oauthError(value: string | string[] | undefined): string | null {
  const code = Array.isArray(value) ? value[0] : value;
  if (!code) return null;
  if (code === "account_not_linked")
    return "Un compte existe déjà avec cette adresse, créé avec un mot de passe. Connecte-toi avec ton e-mail et ton mot de passe.";
  if (code === "access_denied") return "Connexion Google annulée.";
  return "La connexion avec Google n'a pas abouti. Réessaie, ou utilise ton e-mail.";
}

export default async function ConnexionPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const googleEnabled = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
  return (
    <AuthScreen
      initialMode={params.mode === "inscription" ? "inscription" : "connexion"}
      next={safeNext(params.suite)}
      googleEnabled={googleEnabled}
      initialError={oauthError(params.error)}
      resetEnabled={mailEnabled}
      initialForgot={params.oubli === "1"}
    />
  );
}
